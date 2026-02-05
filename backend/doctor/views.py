from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from django.db import connection
from rest_framework import status

class doctorAPI(GenericAPIView):
    def get_queryset(self):
        return []

    def post(self, request):
        print("doctor api")
        data = request.data
        print(data)

        d_name = data.get("name")
        d_qualification = data.get("qualification")
        d_experience = data.get("experience")
        d_email = data.get("email")
        d_phone_no = data.get("phone_no")
        d_gender_id = data.get("gender_id")
        d_specialization = data.get("specialization")
        d_created_by = request.user["user_id"]  # from JWT payload

        if not all([d_name, d_qualification, d_experience, d_email,
                    d_phone_no, d_gender_id, d_specialization]):
            return Response(
                {"error": "All fields are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT create_doctor(%s,%s,%s,%s,%s,%s,%s,%s)",
                [
                    d_name,
                    d_qualification,
                    d_experience,
                    d_email,
                    d_phone_no,
                    d_gender_id,
                    d_specialization,
                    d_created_by
                ]
            )
            row = cursor.fetchone()

        return Response(
            {
                "message": "Doctor created successfully",
                "doctor_id": row[0]
            },
            status=status.HTTP_201_CREATED
        )
