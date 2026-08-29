from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views

router = DefaultRouter()
router.register(r'doctors', api_views.DoctorViewSet, basename='doctor')
router.register(r'patients', api_views.PatientViewSet, basename='patient')
router.register(r'appointments', api_views.AppointmentViewSet, basename='appointment')
router.register(r'tokens', api_views.TokenViewSet, basename='token')
router.register(r'beds', api_views.BedViewSet, basename='bed')
router.register(r'prescriptions', api_views.PrescriptionViewSet, basename='prescription')
router.register(r'history', api_views.PatientHistoryViewSet, basename='history')
router.register(r'bills', api_views.BillViewSet, basename='bill')
router.register(r'claims', api_views.InsuranceClaimViewSet, basename='claim')
router.register(r'ambulances', api_views.AmbulanceViewSet, basename='ambulance')
router.register(r'lab-tests', api_views.LabTestViewSet, basename='lab-test')
router.register(r'lab-orders', api_views.LabOrderViewSet, basename='lab-order')
router.register(r'medicines', api_views.MedicineViewSet, basename='medicine')
router.register(r'pharmacy-dispenses', api_views.PharmacyDispenseViewSet, basename='pharmacy-dispense')
router.register(r'vitals', api_views.PatientVitalsViewSet, basename='vital')
router.register(r'triage', api_views.EmergencyTriageViewSet, basename='triage')
router.register(r'audit-logs', api_views.AuditLogViewSet, basename='audit-log')
router.register(r'notifications', api_views.NotificationViewSet, basename='notification')

urlpatterns = [
    # REST API endpoints
    path('api/hospital/info/', api_views.api_hospital_info, name='api_hospital_info'),
    path('api/auth/register/', api_views.api_register_user, name='api_register'),
    path('api/auth/login/', api_views.api_login, name='api_login'),
    path('api/auth/logout/', api_views.api_logout, name='api_logout'),
    path('api/auth/me/', api_views.api_current_user, name='api_current_user'),
    path('api/dashboard/stats/', api_views.api_admin_dashboard_stats, name='api_admin_dashboard_stats'),
    path('api/search/', api_views.api_global_search, name='api_global_search'),
    path('api/ai/symptom-assistant/', api_views.api_ai_symptom_assistant, name='api_ai_symptom_assistant'),
    path('api/ai/clinical-summary/', api_views.api_ai_clinical_summary, name='api_ai_clinical_summary'),
    path('api/', include(router.urls)),
]

