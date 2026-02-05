// create function 

-- FUNCTION: public.createpatient(character varying, character varying, character varying, date, character, text, character varying, integer, character varying)

-- DROP FUNCTION IF EXISTS public.createpatient(character varying, character varying, character varying, date, character, text, character varying, integer, character varying);

CREATE OR REPLACE FUNCTION public.createpatient(
	p_name character varying,
	p_phone character varying,
	p_email character varying,
	p_dob date,
	p_gender character,
	p_address text,
	p_blood_group character varying,
	p_createdby integer,
	p_document character varying)
    RETURNS integer
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
 new_id INT;
BEGIN

 INSERT INTO patient
 (name, phone_no, email, dob, gender, address, blood_group, createdby,document)
 VALUES
 (p_name, p_phone, p_email, p_dob, p_gender, p_address, p_blood_group, p_createdby,p_document)
 RETURNING patient_id INTO new_id;

 RETURN new_id;

END;
$BODY$;

ALTER FUNCTION public.createpatient(character varying, character varying, character varying, date, character, text, character varying, integer, character varying)
    OWNER TO postgres;





// update patient



-- FUNCTION: public.updatepatient(integer, character varying, character varying, text, character varying, integer, date, character varying, character varying, character varying, character varying)

-- DROP FUNCTION IF EXISTS public.updatepatient(integer, character varying, character varying, text, character varying, integer, date, character varying, character varying, character varying, character varying);

CREATE OR REPLACE FUNCTION public.updatepatient(
	p_id integer,
	p_name character varying,
	p_phone character varying,
	p_address text,
	p_reason character varying,
	p_updatedby integer,
	p_dob date,
	p_blood_group character varying,
	p_status character varying,
	p_gender character varying,
	p_delete_reason character varying,
	p_document character varying)
    RETURNS integer
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
BEGIN

 UPDATE patient
 SET name = COALESCE(p_name, name),
     phone_no = COALESCE(p_phone, phone_no),
     address = COALESCE(p_address, address),
     update_reason = COALESCE(p_reason, update_reason),
     updatedby = p_updatedby,
     dob = COALESCE(p_dob, dob),
     blood_group = COALESCE(p_blood_group, blood_group),
     updatedat = CURRENT_TIMESTAMP,
	 status=coalesce(p_status,status),
	 gender=coalesce(p_gender,gender),
	 delete_reason=coalesce(p_delete_reason,delete_reason),
	 document=coalesce(p_document,document)
 WHERE patient_id = p_id;

 RETURN p_id;

END;
$BODY$;

ALTER FUNCTION public.updatepatient(integer, character varying, character varying, text, character varying, integer, date, character varying, character varying, character varying, character varying,character varying)
    OWNER TO postgres;

// show patient 

-- FUNCTION: public.showpatient(text, text, integer, integer)

-- DROP FUNCTION IF EXISTS public.showpatient(text, text, integer, integer);

CREATE OR REPLACE FUNCTION public.showpatient(
	p_filter text,
	p_key text,
	p_limit integer,
	p_offset integer)
    RETURNS TABLE(patient_id integer, name character varying, phone_no character varying, email character varying, dob date, gender character, address text, status character, createdat timestamp without time zone, updatedat timestamp without time zone, createdby integer, updatedby integer, update_reason character varying, blood_group character varying, delete_reason text, document character varying) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN

 RETURN QUERY
 SELECT *
 FROM patient p
 WHERE (
   p_filter IS NULL 
   OR p_filter = '' 
   OR p_filter = 'all'
   OR p.status = p_filter
 )
 AND (
   p_key IS NULL 
   OR p_key = ''
   OR p.name ILIKE  p_key || '%'
   OR p.phone_no LIKE  p_key || '%'
   OR p.email ILIKE  p_key || '%'
 )
 order by patient_id
 limit p_limit
 offset p_offset;

END;
$BODY$;

ALTER FUNCTION public.showpatient(text, text, integer, integer)
    OWNER TO postgres;

CREATE TABLE patient (
 patient_id SERIAL PRIMARY KEY,
 name VARCHAR(50) NOT NULL,
 phone_no VARCHAR(15) NOT NULL,
 email VARCHAR(50) NOT NULL UNIQUE,
 dob DATE NOT NULL,
 gender CHAR(1) NOT NULL 
   CHECK (gender IN ('m','f','o')),
 address TEXT,

 status CHAR(1) NOT NULL DEFAULT 'a'
   CHECK (status IN ('a','d')),

 createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

 createdby INT DEFAULT 1,
 updatedby INT DEFAULT 1,

 update_reason VARCHAR(100),
 blood_group VARCHAR(5)
);


-- FUNCTION: public.deletepatient(integer)

-- DROP FUNCTION IF EXISTS public.deletepatient(integer);

CREATE OR REPLACE FUNCTION public.deletepatient(
	p_id integer)
    RETURNS integer
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
BEGIN

 UPDATE patient 
 SET status='d' 
 WHERE patient_id=p_id;

 RETURN p_id;

END;
$BODY$;

ALTER FUNCTION public.deletepatient(integer)
    OWNER TO postgres;

-- FUNCTION: public.countpatient(text, text)

-- DROP FUNCTION IF EXISTS public.countpatient(text, text);

CREATE OR REPLACE FUNCTION public.countpatient(
	p_filter text,
	p_key text)
    RETURNS integer
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE total INT;
BEGIN

 SELECT COUNT(*)
 INTO total
 FROM patient p
 WHERE (
   p_filter IS NULL 
   OR p_filter = '' 
   OR p_filter = 'all'
   OR p.status = p_filter
 )
 AND (
   p_key IS NULL 
   OR p_key = ''
   OR p.name ILIKE  p_key || '%'
   OR p.phone_no LIKE  p_key || '%'
   OR p.email ILIKE  p_key || '%'
 );

 RETURN total;

END;
$BODY$;

ALTER FUNCTION public.countpatient(text, text)
    OWNER TO postgres;

create table gender(
g_id serial primary key,
g_code varchar(1),
g_name varchar(20)
);

insert into gender(g_code,g_name)
values
('m','Male'),
('f','Female'),
('o','Other');

create table disease (
  id serial primary key,
  name varchar(50) not null unique,
  created_at timestamp default now()
);


create or replace function getdisease()
returns table (
    id integer,
    name character varying,
    created_at timestamp
)
language plpgsql
as $$
begin
    return query
    select * from disease
    order by id;
end;
$$;


CREATE OR REPLACE FUNCTION public.showpatient(
	p_filter text,
	p_key text,
	p_limit integer,
	p_offset integer)
RETURNS TABLE(
	patient_id integer,
	name character varying,
	phone_no character varying,
	email character varying,
	dob date,
	address text,
	status character,
	createdat timestamp,
	updatedat timestamp,
	createdby integer,
	updatedby integer,
	update_reason character varying,
	blood_group character varying,
	delete_reason text,
	document character varying,
	g_name character varying,
	disease_names character varying
) 
LANGUAGE plpgsql
AS $BODY$
BEGIN

 RETURN QUERY
 SELECT 
   p.patient_id,
   p.name,
   p.phone_no,
   p.email,
   p.dob,
   p.address,
   p.status,
   p.createdat,
   p.updatedat,
   p.createdby,
   p.updatedby,
   p.update_reason,
   p.blood_group,
   p.delete_reason,
   p.document,
   g.g_name,
   string_agg(d.name, ', ') as disease_names

 FROM patient p
 LEFT JOIN gender g 
        ON p.gender_id = g.g_id
 LEFT JOIN disease d 
        ON d.id = ANY(string_to_array(p.disease, ',')::int[])

 WHERE (
   p_filter IS NULL 
   OR p_filter = '' 
   OR p_filter = 'all'
   OR p.status = p_filter
 )
 AND (
   p_key IS NULL 
   OR p_key = ''
   OR p.name ILIKE p_key || '%'
   OR p.phone_no LIKE p_key || '%'
   OR p.email ILIKE p_key || '%'
 )

 GROUP BY 
   p.patient_id,
   p.name,
   p.phone_no,
   p.email,
   p.dob,
   p.address,
   p.status,
   p.createdat,
   p.updatedat,
   p.createdby,
   p.updatedby,
   p.update_reason,
   p.blood_group,
   p.delete_reason,
   p.document,
   g.g_name

 ORDER BY p.patient_id
 LIMIT p_limit
 OFFSET p_offset;

END;
$BODY$;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,

    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION getuserauth()
RETURNS TABLE (
    user_id INTEGER,
    username VARCHAR,
    email VARCHAR,
    password_hash TEXT,
    is_active BOOLEAN,
    is_verified BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        user_id,
        username,
        email,
        password_hash,
        is_active,
        is_verified,
        created_at,
        updated_at
    FROM custom_user
    ORDER BY user_id;
END;
$$;

