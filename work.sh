#!/bin/bash

files=(
  "univerzitet_u_beogradu_saobracajni_fakultet_2016.pdf"
  "univerzitet_u_beogradu_saobracajni_fakultet_2015.pdf"
  "univerzitet_u_beogradu_saobracajni_fakultet_2014.pdf"
#  "univerzitet_u_beogradu_saobracajni_fakultet_2013.pdf"
#  "univerzitet_u_beogradu_saobracajni_fakultet_2011.pdf"
#  "univerzitet_u_beogradu_saobracajni_fakultet_2010.pdf"
#  "univerzitet_u_beogradu_saobracajni_fakultet_2009.pdf"
#  "univerzitet_u_beogradu_saobracajni_fakultet_2008.pdf"
#  "univerzitet_u_beogradu_saobracajni_fakultet_2007.pdf"
#  "univerzitet_u_beogradu_saobracajni_fakultet_2006.pdf"
#  "univerzitet_u_beogradu_saobracajni_fakultet_2005.pdf"
#  "univerzitet_u_beogradu_saobracajni_fakultet_2004.pdf"
#  "univerzitet_u_beogradu_saobracajni_fakultet_2003.pdf"
#  "univerzitet_u_beogradu_saobracajni_fakultet_2002.pdf"
#  "univerzitet_u_beogradu_saobracajni_fakultet_2001.pdf"
)

for file in "${files[@]}"; do
  echo "Processing : $file"
  claude  -p "/solve_document $file solve all the problems. The correct answers are highlighted in green or red or circled or similar mark. If complete solutions are given after the problems read those as well and use those to verify your answers and generate solutions. Make the quality of the solutions
  premium, the best so far. Use full serbian latin (including š, č, ć, ž etc). Delegate to opus team agent swarm so you can save the context to finish the task. Do not check the agents output until they are finished as you're going to go out of context if you do. Once you spawn the agents, try to save the context usage somehow. Do not grade the
  problems."  --dangerously-skip-permissions --model opus
  sleep 10
done