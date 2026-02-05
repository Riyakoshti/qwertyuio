from rest_framework import serializers

class patientinsertSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)
    phone_no = serializers.CharField(max_length=15)
    email = serializers.EmailField(max_length=50)
    address = serializers.CharField(max_length=200)
    created_by=serializers.IntegerField()
    dob = serializers.DateField()
    blood_group = serializers.CharField(max_length=5)
    document=serializers.FileField(required=True)
    gender_id=serializers.IntegerField(required=True)


class patientupdateserializer(serializers.Serializer):
    name = serializers.CharField(max_length=50,required=False)
    phone_no = serializers.CharField(max_length=15,required=False)
    address = serializers.CharField(max_length=200,required=False)
    email=serializers.EmailField(required=False)
    updated_by=serializers.IntegerField(required=False)
    gender = serializers.ChoiceField(choices=[('m','Male'),('f','Female'),('o','Other')],required=False)
    dob = serializers.DateField(required=False)
    blood_group = serializers.CharField(max_length=5,required=False)
    reason = serializers.CharField(max_length=200,required=False)
    status=serializers.CharField(max_length=1,required=False)
    delete_reason=serializers.CharField(max_length=200,required=False)
    document=serializers.FileField(required=False)
    gender_id=serializers.IntegerField(required=False)
