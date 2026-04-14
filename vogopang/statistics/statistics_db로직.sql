select 
    c.id as clientId
    colesce( license_agg.viewCount, 0) as viewCount
from clients c
left joins(

) license_agg on license_agg.clientId = c.id
    


select 
    l.clientId as clientId
    count(l.id) as bookCount,
    coalesce(sum(l.viewCount)) as viewCount, 
    coalesce(sum(l.maxLoanCount)) as copyCount,
from licenses l
