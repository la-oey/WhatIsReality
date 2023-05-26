setwd("/Users/loey/Desktop/Research/FakeNews/WhatIsReality/simulations/")

library(tidyverse)
library(extraDistr)

ns = seq(0,1,0.1)
n = length(ns)
alph.bet = 3



#### General Functions ####
logitToProb <- function(logit){
  exp(logit) / (1+exp(logit))
}

probToLogit <- function(prob){
  log(prob / (1 - prob))
}

softmax <- function(alph, allEV) { ## allEV = vector of numerics
  aev = exp(alph * allEV)
  return(aev/sum(aev))
}

p.k <- function(){
  prior = "b"
  if(prior == "u") {
    matrix(rep(1/n, each=n*n), nrow=n)
  } else if(prior == "b") {
    matrix(rep(dbinom(ns*10,n-1,0.5), each=n), nrow=n)
  } else if(prior == "bb") {
    matrix(rep(dbbinom(round(ns*10), n-1, alph.bet, alph.bet), each=n), nrow=n)
  }
}


## scale between 0 and 1


# sender's utility
# util = {1 = overestimate, -1 = underestimate}
u.S <- function(k, kest, util, cost){ 
  util * kest - cost * (kest - k)^2
}
mapply(function(i) u.S(i, ns, 1, 1), ns)
mapply(function(i) u.S(i, ns, 0, 1), ns)
mapply(function(i) u.S(i, ns, 1, 0), ns)
mapply(function(i) u.S(i, ns, 0, 0), ns)

# receiver's utility
u.R <- function(k, kest){
  -(kest - k)^2
}

u.R(1, seq(0,1,0.01))
matrix(u.R(rep(ns, each=11), ns), nrow=11)


# L0R (all naive) --p(kest|ksay)--> L1S (X% coop, (1-X)% decep) --p(ksay|k)--> L1R  -> L2S
#
# L0R - > P_R0(kest | ksay)
# 
# L1S -> P_util(ksay | k)  given P(kest | ksay)
# marginalize over util to get P_S1(ksay | k)
# 
# L1R -> p_R1(kest | ksay) given P_S1(ksay | k)
# 
# L2S -> P_S2(ksay | k) given p_R1(kest | ksay) assuming honesty


### L0 Receiver ###
### P(kest|ksay) ###
p.L0R_kest <- function() {
  diag(n)
}


### L1 Sender ###
### P(ksay|k) ###
util = 1
cost = 1
alph = 1
EV.L1S_ksay <- function(util, cost) { #x(rows) = ksay, y(cols) = k, z(list) = kest
  arr.pR <- aperm(array(rep(p.L0R_kest(), each=n), dim=c(n,n,n)), c(2,1,3)) # probability that kest is guessed, in a n x n matrix
  arr.uS <- aperm(array(rep(mapply(function(i) u.S(i, ns, util, cost), ns), each=n), dim=c(n,n,n)), c(1,3,2))
  apply(arr.uS * arr.pR, MARGIN=c(1,2), FUN=sum) # listsums -> 2D arr, x(rows) = ksay, y(cols) = k
}


EV.L1S_ksay(1,1)
EV.L1S_ksay(0,1)

p.L1S_ksay <- function(util, cost, alph) {
  EV.S <- EV.L1S_ksay(util, cost)
  arr.ksay.k <- apply(EV.S, MARGIN=2, softmax, alph) # x(rows) = ksay, y(cols) = k
  arr.k <- p.k()
  apply(arr.k*arr.ksay.k, MARGIN=2, function(i) i / sum(i)) # normalize columns to sum to 1
}

round(p.L1S_ksay(1,1,100),3)
round(p.L1S_ksay(0,1,100),3)

### L1 Receiver ###
### P(kest|ksay) ###
EV.L1R_kest <- function(p.defec, cost, alph) { #x(rows) = ksay, y(cols) = k, z(list) = kest
  #arr.pS <- array(rep(p.L1S_ksay(util,cost,alph), n), dim=c(n,n,n)) # probability that ksay is said, in a n x n matrix
  p.defec <- logitToProb(pmin(10, pmax(-10, p.defec)))
  p.L1S <- p.defec * p.L1S_ksay(1,cost,alph) + (1-p.defec) * p.L1S_ksay(0,cost,alph)
  arr.pS <- array(rep(p.L1S, n), dim=c(n,n,n)) # combination of 
  arr.uR <- array(rep(mapply(function(i) u.R(i, ns), ns), each=n), dim=c(n,n,n))
  apply(arr.uR * arr.pS, MARGIN=c(1,3), FUN=sum) # rowsums -> 2D arr, x(rows) = ksay, y(cols) = kest
}

# apply(array(0:7, dim=c(2,2,2)), MARGIN=c(1,3), FUN=sum)
EV.L1R_kest(probToLogit(0.8),1,1)

p.L1R_kest <- function(p.defec, cost, alph) {
  EV.R <- EV.L1R_kest(p.defec, cost, alph)
  apply(EV.R, MARGIN=2, softmax, alph) # x(rows) = ksay, y(cols) = kest
}

round(p.L1R_kest(probToLogit(0.5),1,100),3)
round(p.L1R_kest(probToLogit(0),1,100),3)
round(p.L1R_kest(probToLogit(1),1,100),3)
round(p.L1R_kest(probToLogit(0.5),0,100),3)
# apply(matrix(1:4, nrow=2), MARGIN=2, function(i) i/sum(i))

### L2 Sender ###
### P(ksay|k) ###
EV.L2S_ksay <- function(p.defec, util, cost, alph) { #x(rows) = ksay, y(cols) = k, z(list) = kest
  arr.pR <- aperm(array(rep(p.L1R_kest(p.defec,cost,alph), each=n), dim=c(n,n,n)), c(2,1,3)) # probability that kest is guessed, in a n x n matrix
  arr.uS <- aperm(array(rep(mapply(function(i) u.S(i, ns, util, cost), ns), each=n), dim=c(n,n,n)),c(1,3,2))
  apply(arr.uS * arr.pR, MARGIN=c(1,2), FUN=sum) # listsums -> 2D arr, x(rows) = ksay, y(cols) = k
}

round(EV.L2S_ksay(probToLogit(1),0,1,100),3)

p.L2S_ksay <- function(p.defec, util, cost, alph) {
  EV.S <- EV.L2S_ksay(p.defec, util, cost, alph)
  arr.ksay.k <- apply(EV.S, MARGIN=2, softmax, alph) # x(rows) = ksay, y(cols) = k
  arr.k <- p.k()
  apply(arr.k*arr.ksay.k, MARGIN=2, function(i) i / sum(i)) # normalize columns to sum to 1
}

round(p.L2S_ksay(probToLogit(1),0,1,100),3)
round(p.L2S_ksay(probToLogit(0),0,1,100),3)









