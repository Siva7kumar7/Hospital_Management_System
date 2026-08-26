from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token as AuthToken
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import date

from .models import (
    User, Patient, Doctor, Appointment, Token, Bed,
    Prescription, PatientHistory, Bill, InsuranceClaim, Ambulance
)
from .serializers import (
    UserSerializer, PatientSerializer, DoctorSerializer, AppointmentSerializer,
    TokenSerializer, BedSerializer, PrescriptionSerializer, PatientHistorySerializer,
    BillSerializer, InsuranceClaimSerializer, AmbulanceSerializer
)
from .permissions import IsAdminRole, IsDoctorRole, IsPatientRole, IsAdminOrDoctor


# --- HOSPITAL INFO & PUBLIC DETAILS API ---

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_hospital_info(request):
    total_beds = Bed.objects.count()
    free_beds = Bed.objects.filter(status=Bed.Status.FREE).count()
    occupied_beds = Bed.objects.filter(status=Bed.Status.OCCUPIED).count()
    
    total_ambulances = Ambulance.objects.count()
    available_ambulances = Ambulance.objects.filter(status=Ambulance.Status.AVAILABLE).count()

    return Response({
        'name': 'NextGen HealthCare Hospital',
        'tagline': 'Next-Gen Smart Healthcare & Super Speciality Center',
        'address': 'No. 24, Health Street, Gandhipuram, Coimbatore - 641012, Tamil Nadu, India',
        'location': 'Coimbatore, Tamil Nadu, India',
        'emergency_hotline': '+91 422-1234567 / 108',
        'general_phone': '+91 422-1234567',
        'email': 'care@nextgenhealthcare.com',
        'opd_timings': 'Morning: 09:00 AM - 01:00 PM | Evening: 04:00 PM - 08:00 PM',
        'partner_insurers': [
            'SecureLife Insurance Company',
            'CoverWise Insurance',
            'PolicyPro',
            'InsureMax',
            'RiskFree Insurance',
            'PrimeShield Insurance',
            'UnitedHealthcare',
            'Medicare'
        ],
        'bed_counts': {
            'total': total_beds,
            'available': free_beds,
            'allotted': occupied_beds,
        },
        'ambulance_counts': {
            'total': total_ambulances,
            'available': available_ambulances,
            'on_dispatch': total_ambulances - available_ambulances
        }
    })



# --- AUTHENTICATION API ENDPOINTS ---

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def api_register_user(request):
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name', '')
    last_name = data.get('last_name', '')
    phone = data.get('phone', '')
    role = data.get('role', User.Role.PATIENT)

    if not username or not password or not email:
        return Response({'error': 'Username, email, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username is already taken.'}, status=status.HTTP_400_BAD_REQUEST)

    is_staff = (role == User.Role.ADMIN)
    is_superuser = (role == User.Role.ADMIN)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        role=role,
        is_staff=is_staff,
        is_superuser=is_superuser
    )

    patient_id = None
    doctor_id = None

    if role == User.Role.PATIENT:
        patient = Patient.objects.create(
            user=user,
            dob=data.get('dob') or None,
            gender=data.get('gender', 'Male'),
            address=data.get('address', ''),
            emergency_contact=data.get('emergency_contact', ''),
            blood_group=data.get('blood_group', 'O+'),
            insurance_provider=data.get('insurance_provider', ''),
            policy_number=data.get('policy_number', '')
        )
        patient_id = patient.id
    elif role == User.Role.DOCTOR:
        doctor = Doctor.objects.create(
            user=user,
            specialization=data.get('specialization', 'General Medicine'),
            qualification=data.get('qualification', 'MBBS'),
            experience_years=data.get('experience_years', 1),
            contact_number=phone or '+15550000',
            consultation_fee=data.get('consultation_fee', 80.00),
            availability_days=data.get('availability_days', 'Mon, Tue, Wed, Thu, Fri'),
            time_slot_start=data.get('time_slot_start', '09:00'),
            time_slot_end=data.get('time_slot_end', '17:00')
        )
        doctor_id = doctor.id

    token, _ = AuthToken.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data,
        'patient_id': patient_id,
        'doctor_id': doctor_id,
        'message': f'Account registered successfully as {role}.'
    }, status=status.HTTP_201_CREATED)



@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(request, username=username, password=password)
    if not user:
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    login(request, user)
    token, _ = AuthToken.objects.get_or_create(user=user)
    
    patient_id = None
    doctor_id = None
    if user.role == User.Role.PATIENT and hasattr(user, 'patient_profile'):
        patient_id = user.patient_profile.id
    elif user.role == User.Role.DOCTOR and hasattr(user, 'doctor_profile'):
        doctor_id = user.doctor_profile.id

    return Response({
        'token': token.key,
        'user': UserSerializer(user).data,
        'patient_id': patient_id,
        'doctor_id': doctor_id
    })


@api_view(['POST'])
def api_logout(request):
    logout(request)
    if hasattr(request.user, 'auth_token'):
        request.user.auth_token.delete()
    return Response({'message': 'Logged out successfully.'})


@api_view(['GET'])
def api_current_user(request):
    serializer = UserSerializer(request.user)
    data = serializer.data
    if request.user.role == User.Role.PATIENT and hasattr(request.user, 'patient_profile'):
        data['patient_id'] = request.user.patient_profile.id
    elif request.user.role == User.Role.DOCTOR and hasattr(request.user, 'doctor_profile'):
        data['doctor_id'] = request.user.doctor_profile.id
    return Response(data)


# --- ADMIN DASHBOARD STATS API ---

@api_view(['GET'])
@permission_classes([IsAdminRole])
def api_admin_dashboard_stats(request):
    today = date.today()
    total_patients = Patient.objects.count()
    total_doctors = Doctor.objects.count()
    today_appointments_count = Appointment.objects.filter(appointment_date=today).count()
    
    total_beds = Bed.objects.count()
    occupied_beds = Bed.objects.filter(status=Bed.Status.OCCUPIED).count()
    bed_occupancy_pct = round((occupied_beds / total_beds * 100), 1) if total_beds > 0 else 0.0

    revenue_data = Bill.objects.filter(payment_status=Bill.PaymentStatus.PAID).aggregate(total=Sum('total_amount'))
    total_revenue = float(revenue_data['total'] or 0.00)
    pending_claims_count = InsuranceClaim.objects.filter(status=InsuranceClaim.ClaimStatus.PENDING).count()

    recent_appointments = AppointmentSerializer(Appointment.objects.all()[:5], many=True).data
    recent_bills = BillSerializer(Bill.objects.all().order_by('-created_at')[:5], many=True).data

    return Response({
        'total_patients': total_patients,
        'total_doctors': total_doctors,
        'today_appointments_count': today_appointments_count,
        'total_beds': total_beds,
        'occupied_beds': occupied_beds,
        'bed_occupancy_pct': bed_occupancy_pct,
        'total_revenue': total_revenue,
        'pending_claims_count': pending_claims_count,
        'recent_appointments': recent_appointments,
        'recent_bills': recent_bills,
    })


# --- GLOBAL SEARCH API ---

@api_view(['GET'])
def api_global_search(request):
    query = request.GET.get('q', '').strip()
    patients = []
    doctors = []

    if query:
        patient_qs = Patient.objects.filter(
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query) |
            Q(user__username__icontains=query) |
            Q(blood_group__iexact=query) |
            Q(policy_number__icontains=query)
        )
        doctor_qs = Doctor.objects.filter(
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query) |
            Q(specialization__icontains=query) |
            Q(qualification__icontains=query)
        )
        patients = PatientSerializer(patient_qs, many=True).data
        doctors = DoctorSerializer(doctor_qs, many=True).data

    return Response({'query': query, 'patients': patients, 'doctors': doctors})


# --- DOCTOR & PATIENT VIEWSETS ---

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().select_related('user')
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        data = request.data
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data.get('password', 'doctor123'),
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone', ''),
            role=User.Role.DOCTOR
        )
        doctor = Doctor.objects.create(
            user=user,
            specialization=data['specialization'],
            qualification=data['qualification'],
            experience_years=data.get('experience_years', 0),
            contact_number=data.get('phone', ''),
            consultation_fee=data.get('consultation_fee', 50.00),
            availability_days=data.get('availability_days', 'Mon, Tue, Wed, Thu, Fri'),
            time_slot_start=data.get('time_slot_start', '09:00'),
            time_slot_end=data.get('time_slot_end', '17:00')
        )
        return Response(DoctorSerializer(doctor).data, status=status.HTTP_201_CREATED)


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().select_related('user')
    serializer_class = PatientSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]


# --- APPOINTMENT VIEWSET ---

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_superuser:
            return Appointment.objects.all().select_related('patient__user', 'doctor__user')
        elif user.is_doctor:
            return Appointment.objects.filter(doctor__user=user).select_related('patient__user', 'doctor__user')
        elif user.is_patient:
            return Appointment.objects.filter(patient__user=user).select_related('patient__user', 'doctor__user')
        return Appointment.objects.none()

    def create(self, request, *args, **kwargs):
        user = request.user
        data = request.data
        
        patient_id = data.get('patient')
        if user.is_patient:
            patient = user.patient_profile
        else:
            patient = Patient.objects.get(pk=patient_id)

        doctor = Doctor.objects.get(pk=data['doctor'])
        appointment_date = data['appointment_date']
        time_slot = data['time_slot']

        # Slot conflict validation
        conflict = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            time_slot=time_slot,
            status__in=[Appointment.Status.SCHEDULED, Appointment.Status.RESCHEDULED]
        ).exists()

        if conflict:
            return Response(
                {'error': f"Slot Conflict! Dr. {doctor.user.get_full_name()} is already booked at {time_slot} on {appointment_date}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        appointment = Appointment.objects.create(
            patient=patient,
            doctor=doctor,
            appointment_date=appointment_date,
            time_slot=time_slot,
            notes=data.get('notes', '')
        )
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        appointment = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Appointment.Status.choices):
            appointment.status = new_status
            appointment.save()
            return Response(AppointmentSerializer(appointment).data)
        return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)


# --- TOKEN WALK-IN QUEUE VIEWSET ---

class TokenViewSet(viewsets.ModelViewSet):
    serializer_class = TokenSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        doctor_id = self.request.query_params.get('doctor_id')
        token_date = self.request.query_params.get('date', date.today().isoformat())
        qs = Token.objects.all().select_related('doctor__user', 'patient__user')
        if doctor_id:
            qs = qs.filter(doctor_id=doctor_id)
        if token_date:
            qs = qs.filter(date=token_date)
        return qs

    def create(self, request, *args, **kwargs):
        data = request.data
        user = request.user
        if user.is_patient:
            patient = user.patient_profile
        else:
            patient = Patient.objects.get(pk=data['patient'])

        doctor = Doctor.objects.get(pk=data['doctor'])
        token_date = data.get('date', date.today().isoformat())

        existing_count = Token.objects.filter(doctor=doctor, date=token_date).count()
        token_obj = Token.objects.create(
            doctor=doctor,
            patient=patient,
            date=token_date,
            token_number=existing_count + 1,
            status=Token.Status.WAITING
        )
        return Response(TokenSerializer(token_obj).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        token_obj = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Token.Status.choices):
            token_obj.status = new_status
            token_obj.save()
            return Response(TokenSerializer(token_obj).data)
        return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)


# --- WARD & BED VIEWSET ---

class BedViewSet(viewsets.ModelViewSet):
    queryset = Bed.objects.all().select_related('assigned_patient__user')
    serializer_class = BedSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def assign_patient(self, request, pk=None):
        bed = self.get_object()
        patient_id = request.data.get('patient_id')
        if not patient_id:
            return Response({'error': 'Patient selection required.'}, status=status.HTTP_400_BAD_REQUEST)

        patient = Patient.objects.get(pk=patient_id)
        if bed.status == Bed.Status.OCCUPIED and bed.assigned_patient != patient:
            return Response({'error': f"Bed {bed.bed_number} in {bed.ward_name} is already occupied!"}, status=status.HTTP_400_BAD_REQUEST)

        bed.assigned_patient = patient
        bed.status = Bed.Status.OCCUPIED
        bed.admitted_at = timezone.now()
        bed.save()
        return Response(BedSerializer(bed).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def release_patient(self, request, pk=None):
        bed = self.get_object()
        bed.assigned_patient = None
        bed.status = Bed.Status.FREE
        bed.admitted_at = None
        bed.save()
        return Response(BedSerializer(bed).data)


# --- PRESCRIPTION & HISTORY VIEWSETS ---

class PrescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_patient:
            return Prescription.objects.filter(patient__user=user)
        return Prescription.objects.all()

    def create(self, request, *args, **kwargs):
        data = request.data
        appointment = Appointment.objects.get(pk=data['appointment'])
        
        rx = Prescription.objects.create(
            appointment=appointment,
            patient=appointment.patient,
            doctor=appointment.doctor,
            diagnosis=data['diagnosis'],
            medicines=data['medicines'],
            notes=data.get('notes', '')
        )

        PatientHistory.objects.create(
            patient=appointment.patient,
            doctor=appointment.doctor,
            appointment=appointment,
            diagnosis=rx.diagnosis,
            summary_notes=f"Prescription Recorded: {rx.medicines}"
        )

        appointment.status = Appointment.Status.COMPLETED
        appointment.save()

        return Response(PrescriptionSerializer(rx).data, status=status.HTTP_201_CREATED)


class PatientHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PatientHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        patient_id = self.request.query_params.get('patient_id')
        if user.is_patient:
            return PatientHistory.objects.filter(patient__user=user)
        elif patient_id:
            return PatientHistory.objects.filter(patient_id=patient_id)
        return PatientHistory.objects.all()


# --- BILLING & INSURANCE VIEWSETS ---

class BillViewSet(viewsets.ModelViewSet):
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_patient:
            return Bill.objects.filter(patient__user=user)
        return Bill.objects.all()

    @action(detail=True, methods=['post'])
    def toggle_payment(self, request, pk=None):
        bill = self.get_object()
        bill.payment_status = Bill.PaymentStatus.PAID if bill.payment_status == Bill.PaymentStatus.UNPAID else Bill.PaymentStatus.UNPAID
        bill.save()
        return Response(BillSerializer(bill).data)


class InsuranceClaimViewSet(viewsets.ModelViewSet):
    serializer_class = InsuranceClaimSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_patient:
            return InsuranceClaim.objects.filter(patient__user=user)
        return InsuranceClaim.objects.all()

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminRole])
    def update_status(self, request, pk=None):
        claim = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(InsuranceClaim.ClaimStatus.choices):
            claim.status = new_status
            claim.save()
            return Response(InsuranceClaimSerializer(claim).data)
        return Response({'error': 'Invalid claim status.'}, status=status.HTTP_400_BAD_REQUEST)


class AmbulanceViewSet(viewsets.ModelViewSet):
    queryset = Ambulance.objects.all()
    serializer_class = AmbulanceSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [permissions.AllowAny()]

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def request_dispatch(self, request, pk=None):
        ambulance = self.get_object()
        pickup_location = request.data.get('pickup_location', 'Emergency Location')
        if ambulance.status == Ambulance.Status.AVAILABLE:
            ambulance.status = Ambulance.Status.ON_DISPATCH
            ambulance.current_location = pickup_location
            ambulance.save()
            return Response({'message': f"Ambulance {ambulance.vehicle_number} dispatched to {pickup_location}!", 'ambulance': AmbulanceSerializer(ambulance).data})
        return Response({'error': 'Ambulance is not available.'}, status=status.HTTP_400_BAD_REQUEST)

