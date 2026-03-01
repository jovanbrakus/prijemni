#!/bin/bash

files=(
  "univerzitet_u_beogradu_fakultet_organizacionih_nauka_2015.pdf"
  "univerzitet_u_beogradu_fakultet_organizacionih_nauka_2014.pdf"
)

for file in "${files[@]}"; do
  echo "Processing : $file"
  claude  -p "/solve_document $file solve all the problems. Make the quality of the solutions premium, the best so far. Think as long as you need about those.  Delegate to opus team agent swarm so you can save the context to finish the task. Do not check the agents output until they are
    finished as you're going to go out of context if you do. Once you spawn the agents, try to save the context usage somehow."  --dangerously-skip-permissions --model opus
  sleep 10
done