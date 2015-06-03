--������ �ʱ�ȭ ���ν���
CREATE OR REPLACE PROCEDURE SEQUENCE_RESET ( S_NAME  IN VARCHAR2 )
AS S_VALUE INTEGER;
BEGIN 
    EXECUTE IMMEDIATE 'ALTER SEQUENCE ' || S_NAME ||' MINVALUE 0';
    EXECUTE IMMEDIATE 'SELECT ' || S_NAME ||'.NEXTVAL FROM DUAL' INTO S_VALUE;
    EXECUTE IMMEDIATE 'ALTER SEQUENCE ' || S_NAME ||' INCREMENT BY -'||S_VALUE;
    EXECUTE IMMEDIATE 'SELECT ' || S_NAME ||'.NEXTVAL FROM DUAL' INTO S_VALUE;
    EXECUTE IMMEDIATE 'ALTER SEQUENCE ' || S_NAME ||' INCREMENT BY 1'; 
END ; 
--�ʱ�ȭ ������ ����
EXEC SEQUENCE_RESET ('SEQ_REPLY');
EXEC SEQUENCE_RESET ('SEQ_RATING');
EXEC SEQUENCE_RESET ('SEQ_MOVIEPICTURE');


--reply������
CREATE SEQUENCE SEQ_REPLY START WITH 1 INCREMENT BY 1 MAXVALUE 99999 CYCLE NOCACHE;
--RATING������
CREATE SEQUENCE SEQ_RATING START WITH 1 INCREMENT BY 1 MAXVALUE 99999 CYCLE NOCACHE;
--MOVIEPICTURE
CREATE SEQUENCE SEQ_MOVIEPICTURE START WITH 1 INCREMENT BY 1 MAXVALUE 99999 CYCLE NOCACHE;
--MOVIE ������
CREATE SEQUENCE SEQ_MOVIE START WITH 1 INCREMENT BY 1 MAXVALUE 99999 CYCLE NOCACHE;


--��ȭ��� ���ν���.
CREATE OR REPLACE PROCEDURE ADDMOVIE
(
    name in varchar2,
    genre in varchar2,
    runningtime in varchar2,
    director in varchar2,
    rating in varchar2,
    company in varchar2,
    country in varchar2,
    actors in varchar2,
    image in varchar2,
    opendate in date,
    summary in varchar2
)
IS
    moviecode varchar2(10);
--��ȭ��� ����
begin 
    select 'M'||seq_movie.nextval into moviecode from dual;
    
    insert into movie 
    values(moviecode,name,genre,runningtime,director,rating,company,country,actors,image,opendate,summary);
    
    --�̰͸� �������� ��~
    insert into rating
    values(seq_rating.nextval,moviecode,0);
    commit;
end;


--���� ���ν����� ���� SEATCODE �迭 Ÿ��
CREATE OR REPLACE TYPE SEATCODES AS VARRAY(200) OF VARCHAR2(3);


--���� ���ν���
CREATE OR REPLACE PROCEDURE RESERVEPROC
( p_email in varchar2,
  p_class in varchar2,
  p_phonenumber in varchar2,
  p_name in varchar2,
  p_bookingcode in varchar2,
  p_timecode in varchar2,
  p_screencode in varchar2,
  p_moviecode in varchar2,
  p_totalprice in integer,
  p_seatcount in integer,
  p_seatcodes in SEATCODES
 )
 IS 
    I INTEGER;
 BEGIN
    --��� ���ϸ��� ������Ʈ
    
    IF p_email IS NOT NULL THEN
      UPDATE MEMBER
      SET MILEAGE = CASE 
                     WHEN class = 'D' THEN MILEAGE+p_totalprice*0.02
                     WHEN class = 'C' THEN MILEAGE+p_totalprice*0.04
                     WHEN class = 'B' THEN  MILEAGE+p_totalprice*0.06
                     WHEN class = 'A' THEN  MILEAGE+p_totalprice*0.08
                     WHEN class = 'S' THEN  MILEAGE+p_totalprice*0.1
                     END
      WHERE EMAIL = p_email;
    ELSE 
      INSERT INTO NONMEMBER
      VALUES (p_phonenumber,p_name);
    END IF;
                   
    --BOOKING���̺� ���෹�ڵ� ����
      INSERT
      INTO BOOKING 
      VALUES (p_bookingcode,p_email,p_phonenumber,p_timecode,p_screencode,p_moviecode,p_totalprice,p_seatcount);

     
    --seatcodearr�� ���� ���鼭 BOOKED_SEATS�� �����ϰ� PERFORMANCE_SEAT�� ��뿩�� ������Ʈ.  
    FOR I IN 1 .. p_seatcodes.COUNT
    LOOP
        --BOOKED_SEATS�� INSERT
        INSERT
        INTO BOOKED_SEATS 
        VALUES(p_bookingcode,p_screencode,p_seatcodes(I));
         
        --PERFORMANCE_SEAT UPDATE
        UPDATE
        PERFORMANCE_SEAT 
        SET SEATSTATUS=1 
        WHERE SEATCODE= p_seatcodes(I)
        and SCREENCODE= p_screencode
        and TIMECODE= p_timecode; 
    END LOOP;
    --Ŀ��.
    commit;
END;  

--������� ���ν���
CREATE OR REPLACE PROCEDURE CANCELRESERVEPROC
( p_email in varchar2,
  p_class in varchar2,
  p_bookingcode in varchar2,
  p_totalprice in varchar2
 )
 IS 
    I INTEGER;
 BEGIN
    -- UPDATE PERFORMANCE_SEAT_TABLE
    UPDATE PERFORMANCE_SEAT 
    SET SEATSTATUS=0 
    where (screencode,seatcode,timecode) 
    in (select booked_seats.screencode,booked_seats.seatcode,booking.timecode 
        from booking, booked_seats 
        where booking.bookingcode = booked_seats.bookingcode 
        and booking.bookingcode=p_bookingcode);
    
    --��� ���ϸ��� �ٽ� ��ƾ���
    IF p_email IS NOT NULL THEN
      UPDATE MEMBER
      SET MILEAGE = CASE 
                     WHEN class = 'D' THEN MILEAGE-p_totalprice*0.02
                     WHEN class = 'C' THEN MILEAGE-p_totalprice*0.04
                     WHEN class = 'B' THEN  MILEAGE-p_totalprice*0.06
                     WHEN class = 'A' THEN  MILEAGE-p_totalprice*0.08
                     WHEN class = 'S' THEN  MILEAGE-p_totalprice*0.1
                     END
      WHERE EMAIL = p_email;
    END IF;
    
    --�������̺��� ����(cascade�� booked_seat���̺� �˾Ƽ� ������)
    delete 
    from booking 
    where bookingcode = p_bookingcode;
    commit;
END;  


--�¼� ��Ʈ���� �Ľ��Ͽ� �������ν��� ����.
DECLARE
       p_seatcodes SEATCODES;
       s_seatcodes varchar2(300);
    BEGIN
       s_seatcodes := 'A1,B1,B2';
       SELECT REGEXP_SUBSTR(s_seatcodes, '[^,$]+', 1, LEVEL ) AS �����׸�
                            BULK collect into p_seatcodes
                            FROM DUAL
                            CONNECT BY REGEXP_SUBSTR(s_seatcodes, '[^,$]+', 1, LEVEL ) IS NOT NULL;
       RESERVEPROC('alciakng@uos.ac.kr','D','aa','SUPERPLEX12015-06-012','SUPERPLEX1','M1',60,6,p_seatcodes); 
  END;
  
  
--��ġ����Ʈ �߰� ���ν��� 
CREATE OR REPLACE PROCEDURE WATCHLISTPROC
(p_email in varchar2,
 p_moviecode in varchar2
)
  IS
    IS_ADDED INTEGER;
  BEGIN
--�̹� ��ġ����Ʈ�� �߰��Ǿ����� �˻��Ѵ�.
      select count(*) 
      into IS_ADDED
      from watchlist 
      where email=p_email and moviecode = p_moviecode;
      
      --�߰� �Ǿ����� ������ �߰��Ѵ�.
      IF IS_ADDED=0 THEN
          insert into watchlist 
          values(p_email,p_moviecode); 
      END IF;

      commit;
END;

--��ȭ�� ��������� ������������ ����ϴ� ����.
select round(avg(r.score),1),m.name,m.genre,m.runningtime,m.director,m.rating,m.company,m.country,m.image,to_char(m.opendate, 'yy-mm-dd') as open_date
from rating r, movie m 
where r.moviecode =m.moviecode
group by r.moviecode,m.name,m.genre,m.runningtime,m.director,m.rating,m.company,m.country,m.image,m.opendate
order by avg(r.score) desc;

--���� ������ ��ȭ�� ����ϴ� ����.
select * from movie where moviecode IN (select moviecode from screen_movie where to_date(CURRENT_DATE,'yy-mm-dd') between STARTDATE AND ENDDATE);

--rating list
select round(avg(r.score),1) as avg,count(r.moviecode) as count,m.name,m.genre,m.runningtime,m.director,m.rating,m.company,m.country,m.image,to_char(m.opendate, 'yy-mm-dd') as open_date
from rating r, movie m 
where r.moviecode =m.moviecode
and genre like '%'
group by r.moviecode,m.name,m.genre,m.runningtime,m.director,m.rating,m.company,m.country,m.image,m.opendate
order by m.opendate desc;

--get movielist orderby �����ϼ�
select NAME,GENRE,RUNNINGTIME,DIRECTOR,RATING,COMPANY,COUNTRY,ACTORS,IMAGE,SUMMARY,to_char(OPENDATE, 'yy-mm-dd') as OPENDATE,MOVIECODE from movie where genre like '%' order by OPENDATE DESC;
  
--get movie info 
select round(avg(r.score),1) from movie m,rating r where m.moviecode=r.moviecode and m.moviecode ='M1' group by r.moviecode,m.name,m.genre,m.runningtime,m.director,m.rating,m.company,m.country,m.image,m.opendate,m.summary,m.opendate;
 
--get reservation list
select to_char(time.moviedate, 'yy-mm-dd') as moviedate from booking,booked_seats,movie,time where booking.bookingcode =booked_seats.bookingcode and movie.moviecode=booking.moviecode and booking.timecode= time.timecode and email='alciakng@uos.ac.kr';


--�Ⱓ�� ���ġ(����-�� �׷���(�⺰))
select count(b.totalprice) as count,sum(b.totalprice) as sum,TO_CHAR(t.moviedate,'yy') as year from booking b, time t where t.timecode =b.timecode;
--�Ⱓ�� ���ġ(����-�� �׷���(Ư�� ���� �⺰))k.
select count(b.totalprice) as count ,sum(b.totalprice) as sum,TO_CHAR(t.moviedate,'mm') as month from booking b, time t where t.timecode =b.timecode and TO_CHAR(t.moviedate,'yy')=:y group by TO_CHAR(t.moviedate,'mm');
--�Ⱓ�� ���ġ(����-�� �׷���(Ư�� ���� �Ϻ�))
select count(b.totalprice) as count ,sum(b.totalprice) as sum,TO_CHAR(t.moviedate,'dd') as day from booking b, time t where t.timecode =b.timecode and TO_CHAR(t.moviedate,'yy-mm')=:ym group by TO_CHAR(t.moviedate,'dd');
 
--���� ���ġ(����-��(����) ���ӱ׷���)
select count(b.bookingcode), m.sex from booking b, time t,member m where t.timecode =b.timecode and m.email=b.email and TO_CHAR(t.moviedate,'yy')=:1 group by m.sex;
--���� ���ġ(����-��(����) ���ӱ׷���)
select count(b.bookingcode), m.sex from booking b, time t,member m where t.timecode =b.timecode and m.email=b.email and TO_CHAR(t.moviedate,'yy-mm')=:1 group by m.sex;
--���� ���ġ(����-��(����) ���ӱ׷���)
select count(b.bookingcode), m.sex from booking b, time t,member m where t.timecode =b.timecode and m.email=b.email and TO_CHAR(t.moviedate,'yy-mm-dd')=:1 group by m.sex;

--��ȭ�� ���ġ(����-��ȭ(��) ����׷���
select m.name,count(b.totalprice) as count ,sum(b.totalprice) as sum from time t,booking b,movie m where b.moviecode = m.moviecode and t.timecode=b.timecode and TO_CHAR(t.moviedate,'yy')=:1  group by m.name;
--��ȭ�� ���ġ(����-��ȭ(��) ����׷���
select m.name,sum(b.totalprice) from time t,booking b,movie m where b.moviecode = m.moviecode and t.timecode=b.timecode and TO_CHAR(t.moviedate,'yy-mm')=:1  group by m.name;
--��ȭ�� ���ġ(����-��ȭ(��) ����׷���
select m.name,sum(b.totalprice) from time t,booking b,movie m where b.moviecode = m.moviecode and t.timecode=b.timecode and TO_CHAR(t.moviedate,'yy-mm-dd')=:1  group by m.name;

--��ũ���� ���ġ(����)
select s.screenname,count(b.totalprice) as count ,sum(b.totalprice) as sum from time t,booking b,screen s where b.screencode = s.screencode and t.timecode=b.timecode and TO_CHAR(t.moviedate,'yy')=:y  group by s.screenname;
--��ũ���� ���ġ(����)
select s.screenname,count(b.totalprice) as count ,sum(b.totalprice) as sum from time t,booking b,screen s where b.screencode = s.screencode and t.timecode=b.timecode and TO_CHAR(t.moviedate,'yy-mm')=:ym  group by s.screenname;
--��ũ���� ���ġ(�Ϻ�)
select s.screenname,count(b.totalprice) as count ,sum(b.totalprice) as sum from time t,booking b,screen s where b.screencode = s.screencode and t.timecode=b.timecode and TO_CHAR(t.moviedate,'yy-mm-dd')=:ymd  group by s.screenname;
--��ũ���� ���ġ


--���ɺ� ���ġ(�⺰)
select count(b.bookingcode),substr(TO_CHAR(m.BIRTH,'YY'),0,1) as age from booking b, time t,member m where t.timecode =b.timecode and m.email=b.email and TO_CHAR(t.moviedate,'yy')=:1 group by substr(TO_CHAR(m.BIRTH,'YY'),0,1) ,b.bookingcode;

