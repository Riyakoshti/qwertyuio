# backend\urls.py

from django.contrib import admin
from django.urls import path
from patient.views import PatientAPI,genderAPI,diseaseAPI,patientdetailsAPI
from auth.views import registerAPI,loginAPI,logoutAPI,profileAPI,EmailTokenAPI,VerifyEmailAPI,refreshtokenAPI
from doctor.views import doctorAPI
from django.conf import settings
from django.conf.urls.static import static




urlpatterns = [
    path('admin/', admin.site.urls),
    path('patient/',PatientAPI.as_view()),
    path('gender/',genderAPI.as_view()),
    path('disease/',diseaseAPI.as_view()),
    path('register/',registerAPI.as_view()),
    path('login/',loginAPI.as_view()),
    path('logout/',logoutAPI.as_view()),
    path('profile/',profileAPI.as_view()),
    path('emailtoken/', EmailTokenAPI.as_view()),
    path('verifytoken/<str:token>/', VerifyEmailAPI.as_view()),
    path('refresh/',refreshtokenAPI.as_view()),
    path('patientdetails/',patientdetailsAPI.as_view()),
    path('doctor/',doctorAPI.as_view()),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
