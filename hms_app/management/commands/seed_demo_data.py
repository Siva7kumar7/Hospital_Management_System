from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, time, timedelta

from hms_app.models import (
    User, Patient, Doctor, Appointment, Token, Bed,
    Prescription, PatientHistory, Bill, InsuranceClaim, Ambulance
)

class Command(BaseCommand):
    help = 'Seeds database with realistic demo data for NextGen HealthCare Hospital'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Seeding demo data for NextGen HealthCare Hospital...'))

        # 1. Create Admin
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@nextgenhealthcare.com',
                'first_name': 'System',
                'last_name': 'Admin',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()

        # 2. Create Doctors with specific patient checking/consultation timings
        doctors_data = [
            {
                'username': 'dr.mehta',
                'email': 'dr.mehta@nextgenhealthcare.com',
                'first_name': 'Arjun',
                'last_name': 'Mehta',
                'specialization': 'Cardiologist',
                'qualification': 'MBBS, MD (Cardiology), DM, FACC',
                'experience_years': 15,
                'phone': '+91 422-1234501',
                'consultation_fee': 500.00,
                'availability_days': 'Mon, Tue, Wed, Thu, Fri',
                'time_slot_start': time(9, 0),
                'time_slot_end': time(13, 0),
            },
            {
                'username': 'dr.sharma',
                'email': 'dr.sharma@nextgenhealthcare.com',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'specialization': 'Neurologist',
                'qualification': 'MBBS, DM (Neurology)',
                'experience_years': 12,
                'phone': '+91 422-1234502',
                'consultation_fee': 600.00,
                'availability_days': 'Mon, Wed, Fri',
                'time_slot_start': time(10, 0),
                'time_slot_end': time(16, 0),
            },
            {
                'username': 'dr.iyer',
                'email': 'dr.iyer@nextgenhealthcare.com',
                'first_name': 'Ramesh',
                'last_name': 'Iyer',
                'specialization': 'Orthopedic Surgeon',
                'qualification': 'MBBS, MS (Orthopedics), M.Ch',
                'experience_years': 18,
                'phone': '+91 422-1234503',
                'consultation_fee': 550.00,
                'availability_days': 'Tue, Thu, Sat',
                'time_slot_start': time(9, 0),
                'time_slot_end': time(14, 0),
            },
            {
                'username': 'dr.reddy',
                'email': 'dr.reddy@nextgenhealthcare.com',
                'first_name': 'Kavya',
                'last_name': 'Reddy',
                'specialization': 'Pediatrician',
                'qualification': 'MBBS, MD (Pediatrics), DCH',
                'experience_years': 10,
                'phone': '+91 422-1234504',
                'consultation_fee': 400.00,
                'availability_days': 'Mon, Tue, Thu, Fri',
                'time_slot_start': time(16, 0),
                'time_slot_end': time(20, 0),
            },
            {
                'username': 'dr.patel',
                'email': 'dr.patel@nextgenhealthcare.com',
                'first_name': 'Suresh',
                'last_name': 'Patel',
                'specialization': 'General Physician',
                'qualification': 'MBBS, MD (General Medicine)',
                'experience_years': 14,
                'phone': '+91 422-1234505',
                'consultation_fee': 350.00,
                'availability_days': 'Mon, Tue, Wed, Thu, Fri, Sat',
                'time_slot_start': time(9, 0),
                'time_slot_end': time(17, 0),
            },
            {
                'username': 'dr.verma',
                'email': 'dr.verma@nextgenhealthcare.com',
                'first_name': 'Sneha',
                'last_name': 'Verma',
                'specialization': 'ENT Specialist',
                'qualification': 'MBBS, MS (ENT)',
                'experience_years': 9,
                'phone': '+91 422-1234506',
                'consultation_fee': 450.00,
                'availability_days': 'Wed, Thu, Fri, Sat',
                'time_slot_start': time(14, 0),
                'time_slot_end': time(18, 0),
            }
        ]

        doctors_objs = {}
        for d_data in doctors_data:
            d_user, u_created = User.objects.get_or_create(
                username=d_data['username'],
                defaults={
                    'email': d_data['email'],
                    'first_name': d_data['first_name'],
                    'last_name': d_data['last_name'],
                    'phone': d_data['phone'],
                    'role': User.Role.DOCTOR
                }
            )
            if u_created:
                d_user.set_password('doctor123')
                d_user.save()

            doc, _ = Doctor.objects.get_or_create(
                user=d_user,
                defaults={
                    'specialization': d_data['specialization'],
                    'qualification': d_data['qualification'],
                    'experience_years': d_data['experience_years'],
                    'contact_number': d_data['phone'],
                    'consultation_fee': d_data['consultation_fee'],
                    'availability_days': d_data['availability_days'],
                    'time_slot_start': d_data['time_slot_start'],
                    'time_slot_end': d_data['time_slot_end'],
                }
            )
            doctors_objs[d_data['username']] = doc

        # 3. Create Patients
        patients_data = [
            {
                'username': 'patient.alice',
                'email': 'alice@gmail.com',
                'first_name': 'Alice',
                'last_name': 'Morgan',
                'phone': '+1 (555) 111-2222',
                'gender': 'Female',
                'blood_group': 'A+',
                'address': '742 Evergreen Terrace, Healthcare City, NY',
                'emergency_contact': '+1 (555) 999-0000',
                'insurance_provider': 'BlueCross BlueShield',
                'policy_number': 'POL-994101',
            },
            {
                'username': 'patient.bob',
                'email': 'bob@gmail.com',
                'first_name': 'Bob',
                'last_name': 'Davis',
                'phone': '+1 (555) 333-4444',
                'gender': 'Male',
                'blood_group': 'O+',
                'address': '123 Elm Street, Healthcare City, NY',
                'emergency_contact': '+1 (555) 888-1111',
                'insurance_provider': 'UnitedHealthcare',
                'policy_number': 'POL-881202',
            },
            {
                'username': 'patient.charlie',
                'email': 'charlie@gmail.com',
                'first_name': 'Charlie',
                'last_name': 'Brown',
                'phone': '+1 (555) 555-6666',
                'gender': 'Male',
                'blood_group': 'B+',
                'address': '456 Oak Avenue, Healthcare City, NY',
                'emergency_contact': '+1 (555) 777-2222',
                'insurance_provider': 'Aetna',
                'policy_number': 'POL-771103',
            }
        ]

        patients_objs = {}
        for p_data in patients_data:
            p_user, u_created = User.objects.get_or_create(
                username=p_data['username'],
                defaults={
                    'email': p_data['email'],
                    'first_name': p_data['first_name'],
                    'last_name': p_data['last_name'],
                    'phone': p_data['phone'],
                    'role': User.Role.PATIENT
                }
            )
            if u_created:
                p_user.set_password('patient123')
                p_user.save()

            pat, _ = Patient.objects.get_or_create(
                user=p_user,
                defaults={
                    'gender': p_data['gender'],
                    'blood_group': p_data['blood_group'],
                    'address': p_data['address'],
                    'emergency_contact': p_data['emergency_contact'],
                    'insurance_provider': p_data['insurance_provider'],
                    'policy_number': p_data['policy_number'],
                }
            )
            patients_objs[p_data['username']] = pat

        # 4. Create Appointments
        today = date.today()
        yesterday = today - timedelta(days=1)

        app1, _ = Appointment.objects.get_or_create(
            patient=patients_objs['patient.alice'],
            doctor=doctors_objs['dr.mehta'],
            appointment_date=today,
            time_slot=time(10, 0),
            defaults={
                'status': Appointment.Status.SCHEDULED,
                'notes': 'Routine cardiac checkup & chest pain evaluation.'
            }
        )

        app2, _ = Appointment.objects.get_or_create(
            patient=patients_objs['patient.bob'],
            doctor=doctors_objs['dr.sharma'],
            appointment_date=today,
            time_slot=time(11, 30),
            defaults={
                'status': Appointment.Status.SCHEDULED,
                'notes': 'Migraine evaluation.'
            }
        )

        app3, _ = Appointment.objects.get_or_create(
            patient=patients_objs['patient.charlie'],
            doctor=doctors_objs['dr.reddy'],
            appointment_date=yesterday,
            time_slot=time(16, 30),
            defaults={
                'status': Appointment.Status.COMPLETED,
                'notes': 'High fever & cough.'
            }
        )

        # 5. Create Walk-in Queue Tokens
        Token.objects.get_or_create(
            doctor=doctors_objs['dr.mehta'],
            patient=patients_objs['patient.alice'],
            date=today,
            token_number=1,
            defaults={'status': Token.Status.IN_CONSULTATION}
        )

        Token.objects.get_or_create(
            doctor=doctors_objs['dr.mehta'],
            patient=patients_objs['patient.bob'],
            date=today,
            token_number=2,
            defaults={'status': Token.Status.WAITING}
        )

        # 6. Create Wards & Beds
        beds_spec = [
            ('Cardiac ICU Ward', '101', Bed.Status.OCCUPIED, patients_objs['patient.alice']),
            ('Cardiac ICU Ward', '102', Bed.Status.FREE, None),
            ('General Ward A', '201', Bed.Status.FREE, None),
            ('General Ward A', '202', Bed.Status.OCCUPIED, patients_objs['patient.bob']),
            ('General Ward A', '203', Bed.Status.FREE, None),
            ('Deluxe Executive Suite', '301', Bed.Status.FREE, None),
        ]

        for ward, num, b_status, assigned in beds_spec:
            Bed.objects.get_or_create(
                ward_name=ward,
                bed_number=num,
                defaults={
                    'status': b_status,
                    'assigned_patient': assigned,
                    'admitted_at': timezone.now() if b_status == Bed.Status.OCCUPIED else None
                }
            )

        # 7. Create Prescriptions & Patient History (Last Visit Checking)
        Prescription.objects.get_or_create(
            appointment=app3,
            defaults={
                'patient': patients_objs['patient.charlie'],
                'doctor': doctors_objs['dr.reddy'],
                'diagnosis': 'Acute Respiratory Infection & High Fever',
                'medicines': 'Paracetamol 500mg - 1 tab 3x daily - 5 days\nAzithromycin 250mg - 1 cap daily - 3 days',
                'notes': 'Rest, warm fluids, follow up if fever persists after 3 days.'
            }
        )

        PatientHistory.objects.get_or_create(
            patient=patients_objs['patient.charlie'],
            appointment=app3,
            defaults={
                'doctor': doctors_objs['dr.reddy'],
                'visit_date': yesterday,
                'diagnosis': 'Acute Respiratory Infection',
                'summary_notes': 'Prescribed antibiotics and fever medication.'
            }
        )

        # Also add a past visit history for Alice
        PatientHistory.objects.get_or_create(
            patient=patients_objs['patient.alice'],
            visit_date=today - timedelta(days=15),
            defaults={
                'doctor': doctors_objs['dr.mehta'],
                'diagnosis': 'Mild Hypertension',
                'summary_notes': 'Prescribed Amlodipine 5mg. BP recorded at 135/85.'
            }
        )

        # 8. Create Ambulances
        ambulances_data = [
            ('AMB-101 (ICU Van)', 'Robert Miller', '+1 (800) 999-01', Ambulance.Status.AVAILABLE, 'Hospital Main Entrance Base'),
            ('AMB-102 (Advance Life Support)', 'David Clark', '+1 (800) 999-02', Ambulance.Status.AVAILABLE, 'Hospital Emergency Bay'),
            ('AMB-103 (Emergency Responder)', 'James Wilson', '+1 (800) 999-03', Ambulance.Status.ON_DISPATCH, 'En-route Sector 4 Parkway'),
        ]
        for vnum, dname, dphone, astat, loc in ambulances_data:
            Ambulance.objects.get_or_create(
                vehicle_number=vnum,
                defaults={
                    'driver_name': dname,
                    'driver_phone': dphone,
                    'status': astat,
                    'current_location': loc
                }
            )

        # 9. Create Bills & Insurance Claims
        bill1, _ = Bill.objects.get_or_create(
            patient=patients_objs['patient.charlie'],
            appointment=app3,
            defaults={
                'consultation_fee': 90.00,
                'test_charges': 40.00,
                'bed_charges': 0.00,
                'medicine_charges': 35.00,
                'total_amount': 165.00,
                'payment_status': Bill.PaymentStatus.PAID
            }
        )

        bill2, _ = Bill.objects.get_or_create(
            patient=patients_objs['patient.alice'],
            appointment=app1,
            defaults={
                'consultation_fee': 120.00,
                'test_charges': 200.00,
                'bed_charges': 150.00,
                'medicine_charges': 80.00,
                'total_amount': 550.00,
                'payment_status': Bill.PaymentStatus.UNPAID
            }
        )

        claim_code = f'CLM-{today.strftime("%Y%m%d")}-01'
        if not InsuranceClaim.objects.filter(claim_id=claim_code).exists() and not InsuranceClaim.objects.filter(bill=bill2).exists():
            InsuranceClaim.objects.create(
                bill=bill2,
                patient=patients_objs['patient.alice'],
                claim_id=claim_code,
                insurance_provider='SecureLife Insurance Company',
                policy_number='POL-994101',
                claim_amount=25550.00,
                status=InsuranceClaim.ClaimStatus.PENDING,
                notes='Cardiac ICU evaluation claim.'
            )

        self.stdout.write(self.style.SUCCESS('NextGen HealthCare Hospital demo data successfully seeded!'))
