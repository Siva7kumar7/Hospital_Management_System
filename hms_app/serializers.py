from rest_framework import serializers
from .models import User, Patient, Doctor, Appointment, Token, Bed, Prescription, PatientHistory, Bill, InsuranceClaim, Ambulance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_superuser']


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role=User.Role.PATIENT), source='user', write_only=True, required=False)
    last_visit_info = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = '__all__'

    def get_last_visit_info(self, obj):
        last_history = obj.medical_history.order_by('-visit_date', '-created_at').first()
        if last_history:
            return {
                'visit_date': str(last_history.visit_date),
                'doctor_name': f"Dr. {last_history.doctor.user.get_full_name()}" if last_history.doctor else "Hospital Specialist",
                'diagnosis': last_history.diagnosis,
                'summary_notes': last_history.summary_notes,
            }
        return None


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = '__all__'

    def get_full_name(self, obj):
        return f"Dr. {obj.user.get_full_name() or obj.user.username}"


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    doctor_specialization = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = '__all__'

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name() or obj.patient.user.username

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name() or obj.doctor.user.username}"

    def get_doctor_specialization(self, obj):
        return obj.doctor.specialization


class TokenSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Token
        fields = '__all__'

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name() or obj.patient.user.username

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name() or obj.doctor.user.username}"


class BedSerializer(serializers.ModelSerializer):
    assigned_patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Bed
        fields = '__all__'

    def get_assigned_patient_name(self, obj):
        return obj.assigned_patient.user.get_full_name() if obj.assigned_patient else None


class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = '__all__'

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name() or obj.patient.user.username

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name() or obj.doctor.user.username}"


class PatientHistorySerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = PatientHistory
        fields = '__all__'

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name()}" if obj.doctor else "Hospital Staff"


class BillSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    insurance_claim = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = '__all__'

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name() or obj.patient.user.username

    def get_insurance_claim(self, obj):
        if hasattr(obj, 'insurance_claim'):
            claim = obj.insurance_claim
            return {
                'id': claim.id,
                'claim_id': claim.claim_id,
                'status': claim.status,
                'claim_amount': claim.claim_amount,
                'insurance_provider': claim.insurance_provider,
            }
        return None


class InsuranceClaimSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    bill_id = serializers.ReadOnlyField(source='bill.id')

    class Meta:
        model = InsuranceClaim
        fields = '__all__'

    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name()


class AmbulanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ambulance
        fields = '__all__'
