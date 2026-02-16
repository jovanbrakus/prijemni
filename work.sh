#!/bin/bash

files=(
  "univerzitet_u_beogradu_elektrotehnicki_fakultet_2007.pdf"
  "univerzitet_u_beogradu_elektrotehnicki_fakultet_2008.pdf"
  "univerzitet_u_beogradu_elektrotehnicki_fakultet_2009.pdf"
  "univerzitet_u_beogradu_elektrotehnicki_fakultet_2010.pdf"
  "univerzitet_u_beogradu_elektrotehnicki_fakultet_2011.pdf"
)

echo "Processing resto"
claude  -p "/solve_document univerzitet_u_beogradu_elektrotehnicki_fakultet_2006.pdf solve the second half of the problems (from 11th to 20th). Make the quality of the solutions premium, the best so far. Think as long as you need about those.  Delegate to opus team agent swarm so you can save the context to finish the task."  --dangerously-skip-permissions --model opus

for file in "${files[@]}"; do
  echo "Processing 1/2: $file"
  claude  -p "/solve_document $file solve the first half of the problems (from 1st to 10th). Make the quality of the solutions premium, the best so far. Think as long as you need about those. Delegate to opus team agent swarm so you can save the context to finish the task."  --dangerously-skip-permissions --model opus
  echo "Processing 2/2: $file"
  claude  -p "/solve_document $file solve the second half of the problems (from 11th to 20th). Make the quality of the solutions premium, the best so far. Think as long as you need about those. Delegate to opus team agent swarm so you can save the context to finish the task."  --dangerously-skip-permissions --model opus
done