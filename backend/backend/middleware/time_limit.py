# D:\Adrta\Task1\HPMS\backend\backend\middleware\time_limit.py
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import status
class TimeLimitMiddleware:
    def __init__(self,get_response):
        self.get_response=get_response

    def __call__(self, request):
        # allow auth endpoints always
        if request.path.startswith(( "/refresh")):
            return self.get_response(request)
        current_time=timezone.localtime(timezone.now()).hour
        print("current time:",current_time)
        if current_time<7 or current_time>18:
            return JsonResponse({
                "error":"just bw 9 to 1"
            },status=status.HTTP_400_BAD_REQUEST
            )
        response=self.get_response(request)
        return response