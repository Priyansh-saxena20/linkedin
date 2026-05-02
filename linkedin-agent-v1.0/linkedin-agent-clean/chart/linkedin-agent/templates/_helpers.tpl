{{- define "linkedin-agent.name" -}}
{{- default "linkedin-agent" .Chart.Name }}
{{- end }}

{{- define "linkedin-agent.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "linkedin-agent.backendServiceName" -}}
{{- printf "%s-backend" (include "linkedin-agent.fullname" .) }}
{{- end }}

{{- define "linkedin-agent.frontendServiceName" -}}
{{- printf "%s-frontend" (include "linkedin-agent.fullname" .) }}
{{- end }}

{{- define "linkedin-agent.backendHostForNginx" -}}
{{- printf "%s.%s.svc.cluster.local:%v" (include "linkedin-agent.backendServiceName" .) .Release.Namespace .Values.serviceBackend.port }}
{{- end }}

{{- define "linkedin-agent.secretName" -}}
{{- if .Values.existingSecret }}
{{- .Values.existingSecret }}
{{- else }}
{{- printf "%s-env" (include "linkedin-agent.fullname" .) }}
{{- end }}
{{- end }}

{{- define "linkedin-agent.labels" -}}
app.kubernetes.io/name: {{ include "linkedin-agent.name" . }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "linkedin-agent.selectorLabels" -}}
app.kubernetes.io/name: {{ include "linkedin-agent.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
  CORS: use corsOriginsList (array) to avoid Helm --set comma parsing issues.
  If the list is empty, fall back to corsOrigins (single string; override with -f values file).
*/}}
{{- define "linkedin-agent.corsOriginsValue" -}}
{{- if and .Values.corsOriginsList (gt (len .Values.corsOriginsList) 0) }}
{{- join "," .Values.corsOriginsList }}
{{- else }}
{{- .Values.corsOrigins }}
{{- end }}
{{- end }}
