# 283 맵리듀스(MapReduce)

작성 기준일: 2026-06-01
검색/보강일: 2026-06-04
기준 PDF: `/Users/nes0903/Documents/study/정보처리기사/핵심요약집_2026_정보처리기사필기핵심요약.pdf`
PDF 확인 위치: 40페이지 `283 맵리듀스(MapReduce)`

## 한 줄 요약

- MapReduce는 대용량 데이터를 Map 단계와 Reduce 단계로 나누어 분산 처리하는 프로그래밍 모델이다.

## 한눈에 보는 구조

```mermaid
flowchart LR
    A["입력 데이터"] --> B["Map"]
    B --> C["중간 Key-Value"]
    C --> D["Shuffle/Sort"]
    D --> E["Reduce"]
    E --> F["결과"]
```

## PDF 기준 핵심

- 대용량 데이터를 분산 처리하기 위한 목적으로 개발된 프로그래밍 모델이다.
- `대용량 데이터`, `분산 처리`, `프로그래밍 모델`이 핵심 단서이다.

## 개념 설명

- Map 단계는 입력 데이터를 여러 조각으로 나눠 key-value 형태의 중간 결과를 만든다.
- Shuffle/Sort 단계는 같은 key끼리 모아 Reduce 단계로 전달한다.
- Reduce 단계는 중간 결과를 집계하거나 결합해 최종 결과를 만든다.
- Apache Hadoop MapReduce는 컴퓨트 노드와 저장 노드가 같은 서버 집합에 있는 구조를 전제로 효율적인 분산 처리를 지원한다.

## 시험 포인트

- `Map + Reduce` 두 단계 구조를 기억한다.
- Hadoop은 플랫폼, MapReduce는 프로그래밍 모델이다.
- 대용량 데이터 분산 처리 목적이라는 PDF 문구가 핵심이다.
- 실시간 스트리밍 처리보다 배치 분산 처리의 대표 모델로 이해한다.

## 헷갈리는 비교

| 구분 | Hadoop | MapReduce |
|---|---|---|
| 범위 | 플랫폼/생태계 | 처리 모델 |
| 역할 | 저장, 자원 관리, 처리 기반 | 데이터를 나눠 계산 |
| 단서 | HDFS, YARN, Sqoop | Map, Reduce |

## 예시 또는 암기 포인트

- 문서 여러 개에서 단어 수를 세는 작업은 Map에서 단어를 뽑고 Reduce에서 단어별 개수를 합산하는 방식으로 설명된다.
- 암기식: `Map은 나누고, Reduce는 합친다`.

## 빠른 복습

- MapReduce의 목적은? 대용량 데이터 분산 처리.
- 두 핵심 단계는? Map과 Reduce.
- Hadoop과의 관계는? Hadoop에서 쓰이는 대표 분산 처리 모델이다.

## 상세 보강

```mermaid
flowchart LR
    A["입력 데이터"] --> B["Map"]
    B --> C["중간 key-value"]
    C --> D["Shuffle/Sort"]
    D --> E["Reduce"]
    E --> F["결과"]
```

- MapReduce는 대용량 데이터를 여러 노드에서 나누어 처리하기 위한 프로그래밍 모델이다.
- Map 단계는 입력 데이터를 key-value 형태의 중간 결과로 변환한다.
- Shuffle/Sort 단계는 같은 key를 가진 데이터를 모으고 정렬한다.
- Reduce 단계는 모인 값을 집계하거나 계산해 최종 결과를 만든다.
- 시험에서는 MapReduce를 Hadoop의 처리 모델과 연결하고, HDFS는 저장 계층이라는 점을 구분한다.

| 단계 | 역할 | 예시 |
|---|---|---|
| Map | 데이터 분해·변환 | 단어별 1 생성 |
| Shuffle/Sort | 같은 키 모음 | 같은 단어끼리 묶기 |
| Reduce | 집계·결과 생성 | 단어 빈도 합산 |

## 참고 링크

- [Apache Hadoop MapReduce Tutorial](https://hadoop.apache.org/docs/r3.3.6/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html)
