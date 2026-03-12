#!/bin/bash

files=(
  "univerzitet_u_beogradu_tehnolosko_metalurski_fakultet_2013.pdf"
  "univerzitet_u_beogradu_gradevinski_fakultet_2013.pdf"
  "univerzitet_u_beogradu_matematicki_fakultet_2013.pdf"
  "univerzitet_u_beogradu_fizicki_fakultet_2013_grupa_a.pdf"
  "univerzitet_u_beogradu_rudarsko_geoloski_fakultet_2013_grupa_1.pdf"
)

for file in "${files[@]}"; do
  echo "Processing : $file"
  claude  -p "/solve_document $file solve all the problems. The correct answers are highlighted in green or red or circled or similar mark. If complete solutions are given after the problems read those as well and use those to verify your answers and generate solutions. Make the quality of the solutions
  premium, the best so far. Use full serbian latin (including š, č, ć, ž etc). Delegate to opus team agent swarm so you can save the context to finish the task. Do not check the agents output until they are finished as you're going to go out of context if you do. Once you spawn the agents, try to save the context usage somehow. Do not grade the
  problems."  --dangerously-skip-permissions --model opus
  sleep 10
done