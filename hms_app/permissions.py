from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """Permission class for Admin-only API endpoints."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_superuser)


class IsDoctorRole(permissions.BasePermission):
    """Permission class for Doctor API endpoints."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.role == 'DOCTOR' or request.user.is_superuser)


class IsPatientRole(permissions.BasePermission):
    """Permission class for Patient API endpoints."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.role == 'PATIENT' or request.user.is_superuser)


class IsAdminOrDoctor(permissions.BasePermission):
    """Permission class for Admin or Doctor endpoints."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.role in ['ADMIN', 'DOCTOR'] or request.user.is_superuser)
