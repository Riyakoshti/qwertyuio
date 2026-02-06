from django.db import connection
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
# from rest_framework.authentication import JWTAuthentication
from rest_framework import status


class appointmentAPI(GenericAPIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]

    def get(self, request, appointment_id=None):
        with connection.cursor() as cursor:
            if appointment_id:
                cursor.execute(
                    "SELECT * FROM get_appointments(%s)",
                    [appointment_id]
                )
            else:
                cursor.execute(
                    "SELECT * FROM get_appointments()"
                )

            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()

        data = [dict(zip(columns, row)) for row in rows]
        print(data)

        return Response({
            "success": True,
            "count": len(data),
            "data": data
        })
    


    def post(self, request):
        data = request.data
        # user_id = request.user.id

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT * FROM create_appointment(
                    %s, %s, %s, %s, %s, %s, %s, %s
                )
                """,
                [
                    data.get("patient_id"),
                    data.get("doctor_id"),
                    data.get("staff_id"),  # can be NULL
                    data.get("appointment_date"),
                    data.get("start_time"),
                    data.get("end_time"),
                    data.get("reason"),
                    # user_id
                    1
                ]
            )

            columns = [col[0] for col in cursor.description]
            row = cursor.fetchone()

        return Response(
            {
                "success": True,
                "message": "Appointment created successfully",
                "data": dict(zip(columns, row))
            },
            status=status.HTTP_201_CREATED
        )


    def patch(self, request, appointment_id):
        action = request.query_params.get("action")
        user_id = request.user.id
        data = request.data

        if action == "reschedule":
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT * FROM reschedule_appointment(%s, %s, %s, %s, %s)
                    """,
                    [
                        appointment_id,
                        data.get("appointment_date"),
                        data.get("start_time"),
                        data.get("end_time"),
                        user_id
                    ]
                )
                columns = [col[0] for col in cursor.description]
                row = cursor.fetchone()

            return Response(
                {"success": True, "data": dict(zip(columns, row))}
            )
        if action == "cancel":
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM cancel_appointment(%s, %s)",
                    [appointment_id, user_id]
                )
                columns = [col[0] for col in cursor.description]
                row = cursor.fetchone()

            return Response(
                {"success": True, "data": dict(zip(columns, row))}
            )
        if action == "status":
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM update_appointment_status(%s, %s, %s)",
                    [
                        appointment_id,
                        data.get("status"),
                        user_id
                    ]
                )
                columns = [col[0] for col in cursor.description]
                row = cursor.fetchone()

            return Response(
                {"success": True, "data": dict(zip(columns, row))}
            )

