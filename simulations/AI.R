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

dbbinom(n.sims, n.marbles, alph.bet, alph.bet)



plot(dbbinom(0:100, 100, 3, 3))
max(which(pbbinom(0:100, 100, 3, 3) < .025))
min(which(pbbinom(0:100, 100, 3, 3) > .975)) - 1

plot(dbinom(0:100, 100, 0.5))
qbinom(c(.025, .975), 100, 0.5)
max(which(pbinom(0:100, 100, 0.5) < .025)) # should be equivalent to ^
min(which(pbinom(0:100, 100, 0.5) > .975)) - 1 # should be equivalent to ^^

round(dbbinom(0:100, 100, 3, 3),5)
