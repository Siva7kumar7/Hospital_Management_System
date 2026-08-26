from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
import uuid

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', _('Admin')
        DOCTOR = 'DOCTOR', _('Doctor')
        PATIENT = 'PATIENT', _('Patient')

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PATIENT)
    phone = models.CharField(max_length=20, blank=True, null=True)

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN or self.is_superuser

    @property
    def is_doctor(self):
        return self.role == self.Role.DOCTOR

    @property
    def is_patient(self):
        return self.role == self.Role.PATIENT

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"


class Patient(models.Model):
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    BLOOD_GROUPS = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=50, blank=True)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS, default='O+')
    insurance_provider = models.CharField(max_length=100, blank=True)
    policy_number = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Patient: {self.user.get_full_name() or self.user.username}"


class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.CharField(max_length=100)
    qualification = models.CharField(max_length=100)
    experience_years = models.IntegerField(default=0)
    contact_number = models.CharField(max_length=20)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    availability_days = models.CharField(max_length=200, default="Mon, Tue, Wed, Thu, Fri", help_text="Comma-separated available days")
    time_slot_start = models.TimeField(default='09:00:00')
    time_slot_end = models.TimeField(default='17:00:00')

    def __str__(self):
        return f"Dr. {self.user.get_full_name() or self.user.username} ({self.specialization})"


class Appointment(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')
        RESCHEDULED = 'RESCHEDULED', _('Rescheduled')

    class AppointmentType(models.TextChoices):
        SCHEDULED = 'SCHEDULED', _('Scheduled Appointment')
        WALK_IN = 'WALK_IN', _('Walk-in Token')

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    time_slot = models.TimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    appointment_type = models.CharField(max_length=20, choices=AppointmentType.choices, default=AppointmentType.SCHEDULED)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-appointment_date', '-time_slot']

    def __str__(self):
        return f"Appointment: {self.patient.user.username} with {self.doctor.user.username} on {self.appointment_date} at {self.time_slot}"


class Token(models.Model):
    class Status(models.TextChoices):
        WAITING = 'WAITING', _('Waiting')
        IN_CONSULTATION = 'IN_CONSULTATION', _('In Consultation')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    token_number = models.IntegerField()
    date = models.DateField()
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='tokens')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='tokens')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.WAITING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'token_number']

    def __str__(self):
        return f"Token #{self.token_number} - Dr. {self.doctor.user.username} ({self.date})"


class Prescription(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='prescription', null=True, blank=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='prescriptions')
    diagnosis = models.TextField()
    medicines = models.TextField(help_text="Format: Medicine Name - Dosage - Duration - Instructions")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription for {self.patient.user.username} by Dr. {self.doctor.user.username} ({self.created_at.strftime('%Y-%m-%d')})"


class PatientHistory(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_history')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True)
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    visit_date = models.DateField(auto_now_add=True)
    diagnosis = models.TextField()
    summary_notes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-visit_date', '-created_at']

    def __str__(self):
        return f"History: {self.patient.user.username} on {self.visit_date}"


class Bed(models.Model):
    class Status(models.TextChoices):
        FREE = 'FREE', _('Free')
        OCCUPIED = 'OCCUPIED', _('Occupied')

    ward_name = models.CharField(max_length=100)
    bed_number = models.CharField(max_length=20)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.FREE)
    assigned_patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_bed')
    admitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['ward_name', 'bed_number']

    def __str__(self):
        return f"{self.ward_name} - Bed {self.bed_number} ({self.status})"


class Bill(models.Model):
    class PaymentStatus(models.TextChoices):
        UNPAID = 'UNPAID', _('Unpaid')
        PAID = 'PAID', _('Paid')

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='bills')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    test_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    bed_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    medicine_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_status = models.CharField(max_length=15, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.total_amount = (
            (self.consultation_fee or 0) +
            (self.test_charges or 0) +
            (self.bed_charges or 0) +
            (self.medicine_charges or 0)
        )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Bill #{self.id} for {self.patient.user.username} - ${self.total_amount} ({self.payment_status})"


class InsuranceClaim(models.Model):
    class ClaimStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')

    bill = models.OneToOneField(Bill, on_delete=models.CASCADE, related_name='insurance_claim')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='insurance_claims')
    claim_id = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    insurance_provider = models.CharField(max_length=100)
    policy_number = models.CharField(max_length=100)
    claim_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=ClaimStatus.choices, default=ClaimStatus.PENDING)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Claim #{self.claim_id} - ${self.claim_amount} ({self.status})"


class Ambulance(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', _('Available')
        ON_DISPATCH = 'ON_DISPATCH', _('On Dispatch')
        MAINTENANCE = 'MAINTENANCE', _('In Maintenance')

    vehicle_number = models.CharField(max_length=30, unique=True)
    driver_name = models.CharField(max_length=100)
    driver_phone = models.CharField(max_length=30)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    current_location = models.CharField(max_length=200, default='Hospital Station')

    def __str__(self):
        return f"Ambulance {self.vehicle_number} ({self.status})"

