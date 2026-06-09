#!/bin/bash
# ============================================================
# Criar avaliação de Emerson Xavier (PDF de Jan 28, 2026)
# Assessor: Victor (personal trainer)
#
# ANTES DE RODAR:
#   1. Faça login em https://vfit.app.br e abra o DevTools (F12)
#   2. Vá em Application > Local Storage > vfit.app.br
#   3. Copie o valor de "accessToken" (começa com "ey...")
#   4. Cole no campo TOKEN= abaixo
#   5. Descubra o student_id de Emerson no banco ou pela API:
#      curl -H "Authorization: Bearer SEU_TOKEN" https://api.vfit.app.br/api/v1/students | jq '.data[].id, .data[].full_name'
#   6. Cole o ID de Emerson no STUDENT_ID= abaixo
#   7. Execute: bash scripts/create-assessment-emerson.sh
# ============================================================

TOKEN="COLE_SEU_TOKEN_AQUI"
STUDENT_ID="COLE_O_ID_DE_EMERSON_AQUI"

# Validate inputs
if [[ "$TOKEN" == "COLE_SEU_TOKEN_AQUI" || "$STUDENT_ID" == "COLE_O_ID_DE_EMERSON_AQUI" ]]; then
  echo "❌ Configure TOKEN e STUDENT_ID antes de executar este script."
  exit 1
fi

echo "📋 Criando avaliação de Emerson Xavier..."
echo "Student ID: $STUDENT_ID"

curl -s -X POST "https://api.vfit.app.br/api/v1/assessments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "student_id": "'"$STUDENT_ID"'",
    "assessment_date": "2026-01-28",
    "weight_kg": 99.0,
    "height_cm": 183,
    "protocol": "pollock_7",
    "gender": "male",
    "age": 36,
    "activity_level": "moderate",
    "skinfolds": {
      "chest": 15,
      "axillary": 12,
      "triceps": 9,
      "subscapular": 18,
      "suprailiac": 14,
      "abdominal": 34,
      "thigh": 14
    },
    "measurements": {
      "shoulders": 125,
      "chest": 113,
      "scapular_waist": 125,
      "waist": 101,
      "abdomen": 104,
      "hips": 109,
      "neck": 45,
      "right_thigh": 60,
      "left_thigh": 60,
      "right_calf": 44,
      "left_calf": 43,
      "right_arm": 36,
      "left_arm": 35.5,
      "right_arm_contracted": 40,
      "left_arm_contracted": 39.5,
      "right_forearm": 33,
      "left_forearm": 31,
      "thorax_inspired": 113,
      "thorax_expired": 113,
      "anamnesis_self_image": 10,
      "anamnesis_self_esteem": 10,
      "anamnesis_daily_energy": 5,
      "anamnesis_stress": 2,
      "anamnesis_sleep_quality": 4,
      "anamnesis_meals_per_day": 2,
      "anamnesis_water_liters": 2.5,
      "anamnesis_medications": "Remédio para dormir + antidepressivo",
      "anamnesis_activity_goal_per_week": 5,
      "goal_health_bf_pct": 14,
      "goal_health_weight_kg": 95,
      "goal_health_waist_cm": 95,
      "goal_aesthetic_bf_min": 10,
      "goal_aesthetic_bf_max": 12,
      "goal_aesthetic_weight_min": 89,
      "goal_aesthetic_weight_max": 93
    },
    "notes": "Avaliação realizada em 28/01/2026. Paciente em uso de medicação para sono e antidepressivo. Energia diária comprometida (5/10). Objetivo principal: redução de gordura com manutenção de massa muscular."
  }' | python3 -m json.tool

echo ""
echo "✅ Concluído. Verifique o resultado acima para confirmar o ID da avaliação."
