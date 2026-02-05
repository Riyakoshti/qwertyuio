from django.db import connection
from django.http import HttpRequest
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from patient.serializer import patientinsertSerializer, patientupdateserializer
from rest_framework.parsers import MultiPartParser,FormParser
from django.core.files.storage import default_storage
import uuid
import os

class PatientAPI(GenericAPIView):

    def get_queryset(self):
        return []

    serializer_class = patientinsertSerializer 
    parser_classes=[MultiPartParser,FormParser]
    
    def get(self, request):
        filter=request.query_params.get('filter')
        key = request.query_params.get('key')
        page =int(request.query_params.get('page',1))
        limit=int(request.query_params.get('limit',30))
        offset=((page-1)*limit)

        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM countpatient(%s,%s)", [filter,key])
            count=cursor.fetchone()[0]
            cursor.execute("SELECT * FROM showpatient(%s,%s,%s,%s)", [filter,key,limit,offset])
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()

        data = [dict(zip(columns, row)) for row in rows]
        return Response({
            "data": data,
            "total": count,
            "page": page,
            "limit": limit
        })

    
    def post(self, request):
        print(request.data)
        serializer = patientinsertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        print(serializer.errors)
        data = serializer.validated_data
        print(data)
        disease=request.data.get('disease')
        file=request.FILES.getlist('document')
        
        ogfiles=[]
        print(file)
        filepath=None

        if file:
            for files in file:
                ext = os.path.splitext(files.name)[1]
                newname=f'{uuid.uuid4()}{ext}'
                filepath=default_storage.save(newname,files)
                ogfiles.append(filepath)
        savedlist=' ||,|| '.join(ogfiles)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT createpatient(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                [
                    data['name'],
                    data['phone_no'],
                    data['email'],
                    data['dob'],
            
                    data['address'],
                    data['blood_group'],
                    data['created_by'],
                    savedlist,
                    data['gender_id'],
                    disease
                ]
            )

            # get newly created patient
            cursor.execute(
                "SELECT * FROM patient ORDER BY patient_id DESC LIMIT 1"
            )
            row = cursor.fetchone()

        patient = {
            "patient_id": row[0],
            "name": row[1],
            "phone_no": row[2],
            "email": row[3],
            "dob": row[4],

            "address": row[5],
            "blood_group": row[12],
            "status": row[6],
            "document":row[14],
            "gender_id":row[15],
            "disease":row[16]
        }

        return Response(patient)

    # UPDATE
    def patch(self, request):
        print(request.data)
        serializer = patientupdateserializer(
        data=request.data,
        partial=True   
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        print(data)
        disease=request.data.get('disease')
        file=request.FILES.getlist('document')
        
        ogfiles=[]
        filepath=None

        if file:
            for files in file:
                ext = os.path.splitext(files.name)[1]
                newname=f'{uuid.uuid4()}{ext}'
                filepath=default_storage.save(newname,files)
                ogfiles.append(filepath)
        savedlist=' ||,|| '.join(ogfiles)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT updatepatient(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                [
                    request.data.get('id'),
                    data.get('name'),          
                    data.get('phone_no'),
                    data.get('email'),
                    data.get('address'),
                    data.get('reason'),
                    data.get('updated_by'),                         
                    data.get('dob'),
                    data.get('blood_group'),
                    data.get('status'),
                    data.get('delete_reason'),
                    savedlist,
                    data.get('gender_id'),
                    disease
                ]
            )

        return Response({"message": "Patient updated successfully"})


    # DELETE 
    def delete(self, request):
        id = request.query_params.get('id')
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT deletepatient(%s)",
                [id]
            )

        return Response({"message": "Patient deleted successfully"})

class genderAPI(GenericAPIView):
    def get_queryset(self):
        return []
    
    def get(self,request):
        with connection.cursor() as cursor:
            cursor.execute('select * from getgender()')
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()

            data = [dict(zip(columns, row)) for row in rows]
            print(data)
            return Response(data)
        
from rest_framework.response import Response
from rest_framework import status
from django.db import connection

class diseaseAPI(GenericAPIView):
    def get_queryset(self):
        return []

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute('select * from getdisease()')
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            data = [dict(zip(columns, row)) for row in rows]
            return Response(data)

    def post(self, request):
        choise = request.data.get('choise')
        old_name = request.data.get('old_name')
        new_name = request.data.get('new_name')

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    'select manage_disease(%s,%s,%s)',
                    [choise, old_name, new_name]
                )
                row = cursor.fetchone()
                return Response({"id": row[0]}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
class patientdetailsAPI(GenericAPIView):
    def get_queryset(self):
        return []
    def get(self,request):
         user_id=request.query_params.get('u_id')
         int(user_id)
         with connection.cursor() as cursor:
            cursor.execute('select * from get_patient(%s)',user_id)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            data = [dict(zip(columns, row)) for row in rows]
            print(data)
            return Response(data)
