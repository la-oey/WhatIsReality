library(extraDistr)
library(tidyverse)





n.marbles = 100
n.sims = 10000
alph.bet = 3
lambda = 10

pmin(n.marbles, 
     rbbinom(n.sims, n.marbles, alph.bet, alph.bet) + rpois(n.sims, lambda)) %>%
  as_tibble() %>%
  ggplot(aes(x=value)) +
  geom_histogram(color="black") +
  scale_x_continuous(limits=c(0,100))





plot(dbbinom(0:100, 100, 3, 3))

plot(dbinom(0:100, 100, 0.5))