#!/bin/bash

files=(
  "univerzitet_u_beogradu_elektrotehnicki_fakultet_2010"
  "univerzitet_u_beogradu_elektrotehnicki_fakultet_2011"
  "univerzitet_u_beogradu_elektrotehnicki_fakultet_2012"
  "univerzitet_u_beogradu_elektrotehnicki_fakultet_2013"
  "univerzitet_u_beogradu_elektrotehnicki_fakultet_2014"
  "univerzitet_u_beogradu_elektrotehnicki_fakultet_2015"
  "univerzitet_u_beogradu_elektrotehnicki_fakultet_2016"
)

for file in "${files[@]}"; do
  echo "Converting : $file"
  claude  -p "/convert-problems-batch $file solve all the problems. Split the problems between 5 agents (each should convert 4 problems) to avoid loading all the files into the context by more then 2 agents. Do not check the agents output until they are finished as you're going to go out of context if you do. Once you spawn the agents, try to save the context usage somehow."  --dangerously-skip-permissions --model opus
  sleep 3000
done