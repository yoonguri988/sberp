from django.urls import path

from .views import SalarySummaryView

urlpatterns = [
    path("summary", SalarySummaryView.as_view(), name="salary-analytics-summary"),
]
