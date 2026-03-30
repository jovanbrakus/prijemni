#!/bin/bash

files=(
#  "univerzitet_u_beogradu_fakultet_organizacionih_nauka_2009.pdf"
#  "univerzitet_u_beogradu_fakultet_organizacionih_nauka_2009_drugi_rok.pdf"
#  "univerzitet_u_beogradu_fakultet_organizacionih_nauka_2008.pdf"
#  "univerzitet_u_beogradu_fakultet_organizacionih_nauka_2008_drugi_rok.pdf"
  "univerzitet_u_beogradu_fakultet_organizacionih_nauka_2007.pdf"
  "univerzitet_u_beogradu_fakultet_organizacionih_nauka_2007_drugi_rok.pdf"
  "univerzitet_u_beogradu_fakultet_organizacionih_nauka_2005.pdf"
  "univerzitet_u_beogradu_fakultet_organizacionih_nauka_2004.pdf"
  "univerzitet_u_beogradu_fakultet_organizacionih_nauka_2003.pdf"
)

sleep 1500

for file in "${files[@]}"; do
  echo "Processing : $file"
  claude  -p "/solve_document $file solve all the problems. The correct answers are highlighted in green or red or circled or similar mark. If complete solutions are given after the problems read those as well and use those to verify your answers and generate solutions. Make the quality of the solutions
  premium, the best so far. Use full serbian latin (including š, č, ć, ž etc). Delegate to opus team agent swarm so you can save the context to finish the task. Do not check the agents output until they are finished as you're going to go out of context if you do. Once you spawn the agents, try to save the context usage somehow. Do not grade the
  problems."  --dangerously-skip-permissions --model opus
  sleep 10
done