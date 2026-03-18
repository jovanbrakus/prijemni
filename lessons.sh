#!/bin/bash

codex exec \
  -m gpt-5.4 \
  -c 'web_search="live"' \
  -c 'model_reasoning_effort="xhigh"' \
  --full-auto \
  '$create-lesson 28 think about pedagogical way to present the lesson. Make the theory detailed and also give enough examples user so it can understand it easier. Keep in mind students perspective as she/he is preparing for college admission exam.'

#sleep 6
#
#codex exec \
#  -m gpt-5.4 \
#  -c 'web_search="live"' \
#  -c 'model_reasoning_effort="xhigh"' \
#  --full-auto \
#  '$create-lesson 27 think about pedagogical way to present the lesson. Make the theory detailed and also give enough examples user so it can understand it easier. Keep in mind students perspective as she/he is preparing for college admission exam.'
