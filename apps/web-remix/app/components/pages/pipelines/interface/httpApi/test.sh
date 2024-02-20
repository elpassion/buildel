curl https://buildel-api.fly.dev/api/organizations/1/pipelines/1/runs \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SECRET" \
  -d '{"metadata": {"userId": 123}}'


curl https://buildel-api.fly.dev/api/organizations/1/pipelines/1/runs/1/start \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SECRET"

curl https://buildel-api.fly.dev/api/organizations/1/pipelines/1/runs/1/input \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SECRET" \
  -d '{"block_name": "text_input_1", "input_name": "input", "data": "Content"}'

curl https://buildel-api.fly.dev/api/organizations/1/pipelines/1/runs/1/stop \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SECRET"







curl https://buildel-api.fly.dev/api/organizations/30/pipelines/82/runs \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer exy1YV9q6Qfeyex3rfj395782YPFgt0dE2+Uhs0ejSI=" \
  -d '{"metadata": {"userId": 123}}'


curl https://buildel-api.fly.dev/api/organizations/30/pipelines/82/runs/4501/start \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer exy1YV9q6Qfeyex3rfj395782YPFgt0dE2+Uhs0ejSI="

curl https://buildel-api.fly.dev/api/organizations/30/pipelines/82/runs/4501/input \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer exy1YV9q6Qfeyex3rfj395782YPFgt0dE2+Uhs0ejSI=" \
  -d '{"block_name": "Input", "input_name": "input", "data": "Hello"}'


curl https://buildel-api.fly.dev/api/organizations/30/pipelines/82/runs/4501/stop \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer exy1YV9q6Qfeyex3rfj395782YPFgt0dE2+Uhs0ejSI="
