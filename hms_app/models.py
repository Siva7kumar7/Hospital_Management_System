from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
import uuid

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', _('Admin')
        DOCTOR = 'DOCTOR', _('Doctor')
        PATIENT = 'PATIENT', _('Patient')
        NURSE = 'NURSE', _('Nurse')
        LAB_TECH = 'LAB_TECH', _('Lab Technician')
        PHARMACIST = 'PHARMACIST', _('Pharmacist')
        BILLING = 'BILLING', _('Billing Specialist')

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

    @property
    def is_nurse(self):
        return self.role == self.Role.NURSE

    @property
    def is_lab_tech(self):
        return self.role == self.Role.LAB_TECH

    @property
    def is_pharmacist(self):
        return self.role == self.Role.PHARMACIST

    @property
    def is_billing(self):
        return self.role == self.Role.BILLING

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
    patient_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=50, blank=True)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS, default='O+')
    allergies = models.TextField(blank=True, default='None reported')
    existing_conditions = models.TextField(blank=True, default='None reported')
    current_medications = models.TextField(blank=True, default='None')
    insurance_provider = models.CharField(max_length=100, blank=True)
    policy_number = models.CharField(max_length=100, blank=True)

    def save(self, *args, **kwargs):
        if not self.patient_id:
            import random
            self.patient_id = f"PAT-{random.randint(10000, 99999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Patient: {self.user.get_full_name() or self.user.username} ({self.patient_id})"


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
        CLEANING = 'CLEANING', _('Cleaning & Sanitizing')

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


# --- ENTERPRISE HEALTHCARE EXPANSION MODELS ---

class LabTest(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    category = models.CharField(max_length=50, default='Hematology')
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    normal_range = models.CharField(max_length=100, default='12.0 - 16.0')
    unit = models.CharField(max_length=20, default='g/dL')

    def __str__(self):
        return f"{self.name} ({self.code})"


class LabOrder(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        PROCESSING = 'PROCESSING', _('Processing')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='lab_orders')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='ordered_labs')
    test = models.ForeignKey(LabTest, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    ordered_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"LabOrder #{self.id}: {self.test.name} for {self.patient.user.username} ({self.status})"


class LabReport(models.Model):
    lab_order = models.OneToOneField(LabOrder, on_delete=models.CASCADE, related_name='report')
    result_value = models.CharField(max_length=100)
    is_abnormal = models.BooleanField(default=False)
    technician_notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"LabReport for Order #{self.lab_order.id} - Result: {self.result_value}"


class Medicine(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, default='General Pharmacotherapy')
    stock_quantity = models.IntegerField(default=100)
    reorder_level = models.IntegerField(default=20)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=15.00)
    expiry_date = models.DateField(null=True, blank=True)

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.reorder_level

    def __str__(self):
        return f"{self.name} (Stock: {self.stock_quantity})"


class PharmacyDispense(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.SET_NULL, null=True, blank=True, related_name='dispenses')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='pharmacy_dispenses')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    dispensed_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.total_price and self.medicine:
            self.total_price = self.medicine.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Dispensed {self.quantity} x {self.medicine.name} to {self.patient.user.username}"


class PatientVitals(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='vitals')
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    temperature = models.CharField(max_length=10, default='98.6 °F')
    blood_pressure = models.CharField(max_length=20, default='120/80 mmHg')
    pulse_rate = models.IntegerField(default=72, help_text="BPM")
    oxygen_saturation = models.IntegerField(default=98, help_text="% SPO2")
    respiratory_rate = models.IntegerField(default=16, help_text="breaths/min")
    notes = models.TextField(blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at']

    def __str__(self):
        return f"Vitals for {self.patient.user.username} at {self.recorded_at.strftime('%Y-%m-%d %H:%M')}"


class EmergencyTriage(models.Model):
    class Priority(models.TextChoices):
        CRITICAL = 'CRITICAL', _('Critical 🔴')
        HIGH = 'HIGH', _('High 🟠')
        MODERATE = 'MODERATE', _('Moderate 🟡')
        NORMAL = 'NORMAL', _('Normal 🟢')

    patient_name = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=30)
    chief_complaint = models.TextField()
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MODERATE)
    assigned_doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='emergency_patients')
    assigned_bed = models.ForeignKey(Bed, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, default='TRIAGED')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.priority}] Emergency Triage: {self.patient_name}"


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255)
    details = models.TextField(blank=True)
    ip_address = models.CharField(max_length=45, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"AuditLog [{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}]: {self.user} - {self.action}"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    category = models.CharField(max_length=50, default='General')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"


