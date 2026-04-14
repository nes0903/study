select * 
    from product_episodes pe 
    join column products p on p.no = pe.product_no
    where p.title like '%%'