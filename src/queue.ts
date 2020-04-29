import { Observable, Observer, Subject, BehaviorSubject, of, NEVER, EMPTY } from 'rxjs';
import { auditTime, switchMap, switchMapTo, takeUntil, take, map, concatMap, tap, filter } from 'rxjs/operators';
import { Node } from './node';

export class Queue<T> {
    private root = new Node<Observable<T>>(undefined, -Infinity);
    private loop$: Observable<T>;
    private onEnqueue$ = new Subject<void>();
    private onRun$ = new Subject<void>();
    private onStop$ = new Subject<void>();

    constructor(auditTimeForSamePriority = 0, skipAfterLowestPriority = true) {
        this.loop$ = this.getLoop$();
    }

    public asObservable$() {
        return this.loop$;
    }

    public enqueue(priority: number, operation$: Observable<T>): void {
        this.root.insert(priority, operation$);
        this.onEnqueue$.next();
    }

    public run(): void {
        this.onRun$.next();
    }

    public stop(): void {
        this.onStop$.next();
    }

    private getLoop$(): Observable<T> {
        return this.onRun$
            .pipe(
                switchMap(() => new Observable<T>(
                    (observer: Observer<T>) => {
                        this.executeFromNode(this.root.maximum(), observer);
                    })
                    .pipe(
                        takeUntil(this.onStop$),
                    )
                ),
            );
    }

    private executeFromNode(highestExecutable: Node<Observable<T>>, observer: Observer<T>) {
        const executable$ = new BehaviorSubject<Observable<T> | null>(null);

        executable$
            .pipe(
                concatMap((observable$: Observable<T> | null) => observable$
                    ? observable$.pipe(tap((val: T) => observer.next(val)))
                    : EMPTY,
                ),
                tap(() => {
                    this.root.remove(highestExecutable.key);

                    const max = this.root.maximum();
                    if (max && max.value) {
                        executable$.next(max.value);
                    }
                })
            )
            .subscribe();

        if (highestExecutable && highestExecutable.value) {
            executable$.next(highestExecutable.value);
        } else {
            this.onEnqueue$
                .pipe(take(1))
                .subscribe(() => {
                    const max = this.root.maximum();
                    if (max && max.value) {
                        executable$.next(max.value);
                    }
                });
        }
    }
}
