/*
INFO
- 통계 목록을 보여줄 필요가 있음. => list 매서드가 필요함
- 묶어서 객체로 받음. 
    - 프론트로 부터 statisticType을 받음. 계약 유형
    - 기간 타입을 받음. 월별, 일별 구분. 
    - 기간 조회를 위한 minAggregatedOn, maxAggregatedOn을 받음
- 월별 타입일 경우에, 그달의 시작 날짜를 minAggregatedOn으로 사용함. 
- 
*/
async findClientCalculatedList(
    conditions: StatisticsConditions,
    {options, isMonthl}:{} = {}
){
    const snapshots = await this.find(conditions)
    const orderedSnapshots = this.sortStatisticsSnapshots(snapshots);

    const rows = orderedSnapshots.map((item, index) => 
        this.toAdminStatisticsListRow({
            item,
            previous: orderedSnapshots[index -1],
        })
    )


}

private toAdminStatisticsListRow({
    item,
    previous,
}: {
    item: Statistics;
    previous?: Statistics;
}): AdminStatisticsListRow {
    return {
        id: item.id,
        statisticType: item.statisticType,
        aggregateType: item.aggregateType,
        aggregatedOn: item.aggregatedOn,
        viewCount: item.viewCount,
        loanCount: item.loanCount,
        reservationCount: item.reservationCount,
        userCount: item.userCount,
        newUserCount: item.userCount - (previous?.userCount ?? 0),
        clientCount: item.clientCount,
    };
}

private sortStatisticsSnapshots(items: Statistics[]) {
    return [...items].sort(
        (a , b) => {
            const aggregatedOnCompared = a.aggregatedOn.localeCompare(b.aggregatedOn);

            if(aggregatedOnCompared !== 0){
                return aggregatedOnCompared;
            }

            return a.id - b.id;
        }
    )
}

interface Array<T>{
    /**
     * Sorts an array in place.
     * This method mutates the array and returns a reference to the same array.
     * @param compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
     * value otherwise. If omitted, the elements are sorted in ascending, UTF-16 code unit order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    sort(compareFn?: (a: T, b: T) => number): this;

    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
}

interface String {
    /**
     * Determines whether two strings are equivalent in the current or specified locale.
     * @param that String to compare to target string
     * @param locales A locale string or array of locale strings that contain one or more language or locale tags. If you include more than one locale string, list them in descending order of priority so that the first entry is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime is used. This parameter must conform to BCP 47 standards; see the Intl.Collator object for details.
     * @param options An object that contains one or more properties that specify comparison options. see the Intl.Collator object for details.
     */
    localeCompare(that: string, locales?: Intl.LocalesArgument, options?: Intl.CollatorOptions): number;
}

declare namespace Intl {

    interface CollatorOptions {
    usage?: "sort" | "search" | undefined;
    localeMatcher?: "lookup" | "best fit" | undefined;
    numeric?: boolean | undefined;
    caseFirst?: "upper" | "lower" | "false" | undefined;
    sensitivity?: "base" | "accent" | "case" | "variant" | undefined;
    collation?: "big5han" | "compat" | "dict" | "direct" | "ducet" | "emoji" | "eor" | "gb2312" | "phonebk" | "phonetic" | "pinyin" | "reformed" | "searchjl" | "stroke" | "trad" | "unihan" | "zhuyin" | undefined;
    ignorePunctuation?: boolean | undefined;
}

        /**
     * A string that is a valid [Unicode BCP 47 Locale Identifier](https://unicode.org/reports/tr35/#Unicode_locale_identifier).
     *
     * For example: "fa", "es-MX", "zh-Hant-TW".
     *
     * See [MDN - Intl - locales argument](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument).
     */
    type UnicodeBCP47LocaleIdentifier = string;

    /**
     * The locale or locales to use
     *
     * See [MDN - Intl - locales argument](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument).
     */
    type LocalesArgument = UnicodeBCP47LocaleIdentifier | Locale | readonly (UnicodeBCP47LocaleIdentifier | Locale)[] | undefined;
}

interface Locale extends LocaleOptions {
    /** A string containing the language, and the script and region if available. */
    baseName: string;
    /** The primary language subtag associated with the locale. */
    language: string;
    /** Gets the most likely values for the language, script, and region of the locale based on existing values. */
    maximize(): Locale;
    /** Attempts to remove information about the locale that would be added by calling `Locale.maximize()`. */
    minimize(): Locale;
    /** Returns the locale's full locale identifier string. */
    toString(): UnicodeBCP47LocaleIdentifier;
}

interface LocaleOptions {
    /** A string containing the language, and the script and region if available. */
    baseName?: string;
    /** The part of the Locale that indicates the locale's calendar era. */
    calendar?: string;
    /** Flag that defines whether case is taken into account for the locale's collation rules. */
    caseFirst?: LocaleCollationCaseFirst;
    /** The collation type used for sorting */
    collation?: string;
    /** The time keeping format convention used by the locale. */
    hourCycle?: LocaleHourCycleKey;
    /** The primary language subtag associated with the locale. */
    language?: string;
    /** The numeral system used by the locale. */
    numberingSystem?: string;
    /** Flag that defines whether the locale has special collation handling for numeric characters. */
    numeric?: boolean;
    /** The region of the world (usually a country) associated with the locale. Possible values are region codes as defined by ISO 3166-1. */
    region?: string;
    /** The script used for writing the particular language used in the locale. Possible values are script codes as defined by ISO 15924. */
    script?: string;
}





private sortStatisticsSnapshots(items: Statistics[]){
    return [...itmes].sort((a,b) => {
        a.aggregatedOn.localeCompare
    })
}



@Entity('statistics')
export class Statistics extends DddAggregate {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ comment: '통계 타입' })
    statisticType!: ContractType;

    @Column({ comment: '집계 타입' })
    aggregateType!: AggregateType;

    @Column({ comment: '조회 수' })
    viewCount!: number;

    @Column({ comment: '대출 수' })
    loanCount!: number;

    @Column({ comment: '예약 수' })
    reservationCount!: number;

    @Column({ comment: '이용자 수' })
    userCount!: number;

    @Column({ comment: '총 도서관 수', nullable: true })
    clientCount?: number;

    @Column({ comment: '보유 도서 수', nullable: true })
    bookCount?: number;

    @Column({ comment: '보유 카피 수', nullable: true })
    copyCount?: number;

    @Column({ comment: '도서관 ID', nullable: true })
    clientId?: number;

    @Column({ comment: '집계 날짜(YYYY-MM-DD)' })
    aggregatedOn!: CalendarDate;

    constructor(args: Ctor) {
        super();
        if (args) {
            this.statisticType = args.statisticType;
            this.aggregateType = args.aggregateType;
            this.viewCount = args.viewCount;
            this.loanCount = args.loanCount;
            this.reservationCount = args.reservationCount;
            this.userCount = args.userCount;
            this.clientCount = args.clientCount;
            this.bookCount = args.bookCount;
            this.copyCount = args.copyCount;
            this.clientId = args.clientId;
            this.aggregatedOn = args.aggregatedOn;
        }
    }
}


async find(conditions: StatisticsConditions, options?: PaginationOptions) {
    return this.entityManager.find(this.entityClass, {
        where: stripUndefined({
            id: conditions.id,
            statisticType: conditions.statisticType,
            aggregateType: conditions.aggregateType,
            aggregatedOn:
                conditions.aggregatedOn ??
                checkRangeValue(conditions.minAggregatedOn, conditions.maxAggregatedOn),
            clientId: conditions.clientId,
        }),
        ...convertOptions(options),
    });
}


type StatisticsConditions = {
    id?: number;
    statisticType?: ContractType;
    aggregateType?: AggregateType;
    aggregatedOn?: string;
    minAggregatedOn?: string;
    maxAggregatedOn?: string;
    clientId?: number;
};


