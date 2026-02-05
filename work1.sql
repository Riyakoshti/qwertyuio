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



CREATE OR REPLACE FUNCTION createpatient(
 p_name VARCHAR,
 p_phone VARCHAR,
 p_email VARCHAR,
 p_dob DATE,
 p_gender CHAR,
 p_address TEXT,
 p_blood_group VARCHAR,
 p_createdby INT
)
RETURNS INT
AS $$
DECLARE
 new_id INT;
BEGIN

 INSERT INTO patient
 (name, phone_no, email, dob, gender, address, blood_group, createdby)
 VALUES
 (p_name, p_phone, p_email, p_dob, p_gender, p_address, p_blood_group, p_createdby)
 RETURNING patient_id INTO new_id;

 RETURN new_id;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION updatepatient(
 p_id INT,
 p_name VARCHAR,
 p_phone VARCHAR,
 p_address TEXT,
 p_reason VARCHAR,
 p_updatedby INT,
 p_dob DATE,
 p_blood_group VARCHAR,
 p_status varchar,
 p_gender varchar
)
RETURNS INT
AS $$
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
	 gender=coalesce(p_gender,gender)
 WHERE patient_id = p_id;

 RETURN p_id;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deletepatient(p_id INT)
RETURNS INT
AS $$
BEGIN

 UPDATE patient 
 SET status='d' 
 WHERE patient_id=p_id;

 RETURN p_id;

END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION showpatient(p_key TEXT)
RETURNS TABLE(
 patient_id INT,
 name VARCHAR,
 phone_no VARCHAR,
 email VARCHAR,
 dob DATE,
 gender CHAR,
 address TEXT,
 status CHAR,
 createdat TIMESTAMP,
 updatedat TIMESTAMP,
 createdby INT,
 updatedby INT,
 update_reason VARCHAR,
 blood_group VARCHAR
)
AS $$
BEGIN

 RETURN QUERY
 SELECT *
 FROM patient p
 WHERE p.status = 'a'
 AND (
   p_key IS NULL 
   OR p_key = ''
   OR p.name ILIKE  p_key || '%'
   OR p.phone_no LIKE  p_key || '%'
   OR p.email ILIKE  p_key || '%'
 );

END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION showpatient(p_key TEXT)
RETURNS TABLE(
 patient_id INT,
 name VARCHAR,
 phone_no VARCHAR,
 email VARCHAR,
 dob DATE,
 gender CHAR,
 address TEXT,
 status CHAR,
 createdat TIMESTAMP,
 updatedat TIMESTAMP,
 createdby INT,
 updatedby INT,
 update_reason VARCHAR,
 blood_group VARCHAR,
 delete_reason TE
)
AS $$
BEGIN

 RETURN QUERY
 SELECT *
 FROM patient p
 WHERE p.status = 'a'
 AND (
   p_key IS NULL 
   OR p_key = ''
   OR p.name ILIKE  p_key || '%'
   OR p.phone_no LIKE  p_key || '%'
   OR p.email ILIKE  p_key || '%'
 );

END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION showpatient(p_filter TEXT , p_key TEXT)
RETURNS TABLE(
 patient_id INT,
 name VARCHAR,
 phone_no VARCHAR,
 email VARCHAR,
 dob DATE,
 gender CHAR,
 address TEXT,
 status CHAR,
 createdat TIMESTAMP,
 updatedat TIMESTAMP,
 createdby INT,
 updatedby INT,
 update_reason VARCHAR,
 blood_group VARCHAR,
 delete_reason TEXT
)
AS $$
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
 );

END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION showpatient(p_filter TEXT , p_key TEXT , p_limit INT , p_offset INT)
RETURNS TABLE(
 patient_id INT,
 name VARCHAR,
 phone_no VARCHAR,
 email VARCHAR,
 dob DATE,
 gender CHAR,
 address TEXT,
 status CHAR,
 createdat TIMESTAMP,
 updatedat TIMESTAMP,
 createdby INT,
 updatedby INT,
 update_reason VARCHAR,
 blood_group VARCHAR,
 delete_reason TEXT
)
AS $$
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
$$ LANGUAGE plpgsql;
