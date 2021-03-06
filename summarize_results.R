#setwd("anon_results")

library("jsonlite")
library("tidyverse")


anon_results = list.files("../anon_results")
summary <- data.frame(
  participantId = integer(),
  trialId = integer(),
  itemsTested = integer(),
  timeExploring = double(),
  utteranceType = character(),
  proportionSuccess = double(),
  probabilityOfFeature = double(),
  genericEndorsement = logical(),
  stringsAsFactors = FALSE
)
names(summary) <- c("particpantId", "trialId", "itemsTested", "timeExploring", "utteranceType", "proportionSuccess", "probabilityOfFeature")
events <- vector("list", length(anon_results))
trial_summaries <- vector("list", length(anon_results))
df <- data.frame()
i = 0
for (anon_result in anon_results) {
  result_json = fromJSON(anon_result)[[7]]
  

  
  trial_summary = result_json[[5]]
  df <- bind_rows(
    df,
    left_join( trial_summary,
               result_json$trials %>% 
                 select(-events, -testResults, -trial_type) %>% 
                 gather(key, val, -id) %>%
                 drop_na() %>% 
                 spread(key, val)
    ) %>% mutate(workerid = i)
  )

  
  
  trials = result_json[[6]]
  individual_events = vector("list", length(fromJSON(anon_results[[1]])[[7]][[5]]))
  
  
  for (row in 1:nrow(trial_summary)) {
    trial_explore = filter(trials, !is.na(id), id == trial_summary[row, "id"], trial_type == "explore")
    trial_prob = filter(trials, !is.na(id), id == trial_summary[row, "id"], trial_type == "testProb")
    trial_generic = filter(trials, !is.na(id), id == trial_summary[row, "id"], trial_type == "testGeneric")
    individual_events[[row]] <- transmute(trial_explore[1, "events"][[1]], event = event, timestamp = time - trial_explore[1, "events"][[1]][1, "time"])
    summary <- rbind(summary, data.frame(
      participantId = i, 
      trialId = trial_summary[row, "id"], 
      itemsTested = trial_explore[1, "itemsTested"], 
      timeExploring = trial_explore[1, "timeExploring"], 
      utteranceType = trial_summary[row, "utteranceType"], 
      proportionSuccess = trial_summary[row, "proportionSuccess"],
      probabilityOfFeature = trial_prob[1, "probabilityOfFeature"],
      genericEndorsement = trial_generic[1, "genericEndorsement"] == "Yes"))
  }
  i = i + 1
  events[[i]] <- individual_events
  trial_summaries[[i]] <- trial_summary
}

#result_json$trials %>% select(-events, -testResults)



