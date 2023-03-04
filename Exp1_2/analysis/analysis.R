setwd("/Users/loey/Desktop/Research/FakeNews/WhatIsReality/Exp1/analysis/")

library(tidyverse)
library(lme4)
library(lmerTest)

sender <- read_csv("sender.csv")
receiver <- read_csv("receiver.csv")
trials <- read_csv("trials.csv")

sender %>%
  distinct(subjID, goal, cost) %>%
  count(goal, cost)


# computer algorithm
## computer sender
ggplot(receiver, aes(x=k, y=ksay, colour=goal)) +
  geom_jitter(alpha=0.5) +
  geom_abline(slope=1) +
  scale_x_continuous(limits=c(0,100)) +
  scale_y_continuous(limits=c(0,100))

## computer receiver
ggplot(sender, aes(x=ksay, y=kest, colour=goal)) +
  geom_jitter(alpha=0.5) +
  geom_abline(slope=1) +
  scale_x_continuous(limits=c(0,100)) +
  scale_y_continuous(limits=c(0,100))




### Trial Data ###


subjScores <- trials %>%
  group_by(subjID) %>%
  mutate(subjID = paste0(cost,", ",goal," - ",substring(subjID,6))) %>%
  select(subjID, roleCurrent, trialNumber,
         playerTotalScore, oppTotalScore) %>%
  gather("p", "totalscore", 4:5) %>%
  mutate(p = ifelse(p == "oppTotalScore", "opponent total score", "player total score"),
         p = factor(p, levels=c("player total score", "opponent total score")))
ggplot(subjScores, aes(x=trialNumber, y=totalscore, colour=p)) +
  geom_line() +
  scale_x_continuous("trial number") +
  scale_y_continuous("cumulative total score") +
  facet_wrap(~subjID) +
  theme_bw() +
  theme(strip.text = element_text(size=8)) +
  theme(legend.title = element_blank())
ggsave("img/scores.png")

trials %>%
  mutate(playerAdvantage = playerTotalScore - oppTotalScore) %>%
  ggplot(aes(x=trialNumber, y=playerAdvantage, colour=subjID)) +
  geom_line(alpha=0.5) +
  guides(colour=FALSE) +
  facet_grid(cost ~ goal) +
  theme_bw()
ggsave("img/scoreAdvantage.png")

sender %>%
  mutate(bias = ksay - k) %>%
  ggplot(aes(x=trialNumber, y=bias)) +
  geom_smooth() +
  guides(colour=FALSE) +
  facet_grid(cost ~ goal) +
  theme_bw()

sender %>%
  mutate(bias = ksay - k,
         bin = floor(trialNumber/10)) %>%
  group_by(cost, goal, subjID, bin) %>%
  summarise(mean.bias = mean(bias)) %>%
  ggplot(aes(x=bin, y=mean.bias, colour=subjID)) +
  geom_line(alpha=0.5, size=0.2) +
  guides(colour=FALSE) +
  facet_grid(cost ~ goal) +
  theme_bw()

receiver %>%
  mutate(bias = kest - ksay) %>%
  ggplot(aes(x=trialNumber, y=bias)) +
  geom_smooth() +
  facet_grid(cost ~ goal) +
  theme_bw()

receiver %>%
  mutate(bias = kest - ksay) %>%
  ggplot(aes(x=trialNumber, y=bias, colour=subjID)) +
  geom_line(alpha=0.5, size=0.2) +
  guides(colour=FALSE) +
  facet_grid(cost ~ goal) +
  theme_bw()






ggplot(sender, aes(x=ksay)) +
  geom_histogram() +
  facet_wrap(~subjID)
ggsave("img/hist_ksay_s.png")

ggplot(sender, aes(x=ksay, colour=subjID)) +
  geom_vline(xintercept=50, lty=2, colour="grey") +
  geom_density() +
  scale_x_continuous(limits=c(0,100)) +
  guides(colour=FALSE) +
  facet_grid(cost ~ goal, scale="free") +
  theme_bw()
ggsave("img/dens_ksay_s.png")

sender %>%
  count(cost, goal, k, ksay) %>%
  ggplot(aes(x=k, y=ksay, fill=n)) +
  geom_tile() +
  facet_grid(cost ~ goal) +
  theme_bw()

sender %>%
  mutate(kbin = floor(k / 5)*5,
         ksaybin = floor(ksay / 5)*5) %>%
  count(cost, goal, kbin, ksaybin) %>%
  group_by(cost, goal, kbin) %>%
  mutate(prop = n / sum(n)) %>%
  ggplot(aes(x=kbin, y=ksaybin, fill=prop)) +
  geom_tile() +
  facet_grid(cost ~ goal) +
  theme_test()

sender %>%
  mutate(kbin = floor(k / 3)*3,
         ksaybin = floor(ksay / 3)*3) %>%
  count(cost, goal, kbin, ksaybin) %>%
  group_by(cost, goal, kbin) %>%
  mutate(prop = n / sum(n)) %>%
  ggplot(aes(x=kbin, y=ksaybin, fill=prop)) +
  geom_tile() +
  facet_grid(cost ~ goal) +
  theme_test()
ggsave("img/tile_ksaybin.png")

s.bias <- sender %>%
  group_by(goal, cost) %>%
  summarise(bias.ksay = mean(ksay-k),
            median.ksay = median(ksay-k)) %>%
  mutate(bias = paste0("bar(x) == ", round(bias.ksay,2)),
         cost = paste(cost, "cost"),
         goal = paste(goal, "goal"))

sender %>%
  group_by(goal) %>%
  summarise(bias.ksay = mean(ksay-k))

sender %>%
  mutate(kdiffs = ksay - k,
         cost = paste(cost, "cost"),
         goal = paste(goal, "goal")) %>%
  ggplot(aes(x=kdiffs)) +
  geom_vline(xintercept = 0) +
  geom_vline(data=s.bias, aes(xintercept=bias.ksay), colour="gray") +
  geom_histogram(aes(fill=cond), colour="black") +
  geom_text(data=s.bias, aes(x=40, y=600, label=bias), parse=TRUE) +
  scale_x_continuous("reported - truth") +
  scale_y_continuous("count", limits=c(0,1000), expand=c(0,0)) +
  scale_fill_manual(values=condcolors) +
  facet_grid(cost ~ goal) +
  guides(fill=FALSE) +
  theme_classic() +
  theme(strip.background = element_rect(fill=panelcolor),
        axis.title.x=element_text(face="italic"))
 ggsave("img/hist_ksaydiff.png")

# mean kdiff
sender %>%
  mutate(kdiffs = ksay - k) %>%
  group_by(subjID, cost, goal) %>%
  summarise(mean = mean(kdiffs)) %>%
  ggplot(aes(x=mean)) +
  geom_histogram(fill="white", colour="black") +
  ggtitle("Sender: ksay - k") +
  facet_grid(cost ~ goal)

sender %>%
  ggplot(aes(x=oppTrialScore)) +
  geom_histogram(fill="white", colour="black") +
  ggtitle("Sender: kest - k") +
  facet_grid(cost ~ goal)




ggplot(receiver, aes(x=kest)) +
  geom_histogram() +
  facet_wrap(~subjID)
ggsave("img/hist_kest_r.png")

ggplot(receiver, aes(x=kest, colour=subjID)) +
  geom_vline(xintercept=50, lty=2, colour="grey") +
  geom_density() +
  scale_x_continuous(limits=c(0,100)) +
  guides(colour=FALSE) +
  facet_grid(cost ~ goal, scale="free") +
  theme_bw()
ggsave("img/dens_kest_r.png")

receiver %>%
  count(cost, goal, ksay, kest) %>%
  ggplot(aes(x=ksay, y=kest, fill=n)) +
  geom_tile() +
  facet_grid(cost ~ goal) +
  theme_bw()

df.identity = data.frame(goal=rep(unique(receiver$goal), each=21*21*2), 
                         cost = rep(unique(receiver$cost), each=21*21),
                         ksaybin=rep(seq(0,100,5), each=21), 
                         kestbin=seq(0,100,5)) %>%
  mutate(i = ifelse(ksaybin == kestbin, TRUE, FALSE))

receiver %>%
  mutate(kestbin = floor(kest / 5)*5,
         ksaybin = floor(ksay / 5)*5) %>%
  count(cost, goal, kestbin, ksaybin) %>%
  group_by(cost, goal, kestbin) %>%
  mutate(prop = n / sum(n)) %>%
  left_join(df.identity) %>%
  ggplot(aes(x=ksaybin, y=kestbin, fill=prop, colour=i)) +
  geom_tile() +
  scale_fill_gradient(low="gray80", high="darkorchid") +
  scale_colour_manual(values=c("transparent","black")) +
  guides(colour=FALSE) +
  facet_grid(cost ~ goal) +
  theme_test()

receiver %>%
  mutate(kdiffr = kest - ksay) %>%
  ggplot(aes(x=kdiffr)) +
  geom_histogram(fill="white", colour="black") +
  ggtitle("Receiver: kest - ksay") +
  facet_grid(cost ~ goal)

receiver %>%
  mutate(kdiffr = kest - ksay) %>%
  group_by(subjID, cost, goal) %>%
  summarise(mean = mean(kdiffr)) %>%
  ggplot(aes(x=mean)) +
  geom_histogram(fill="white", colour="black") +
  ggtitle("Receiver: kest - ksay") +
  scale_x_continuous(limits=c(-55,55)) +
  facet_grid(cost ~ goal)


receiver %>%
  count(cost, goal, k, kest) %>%
  ggplot(aes(x=k, y=kest, fill=n)) +
  geom_tile() +
  facet_grid(cost ~ goal) +
  theme_bw()

receiver %>%
  ggplot(aes(x=k, y=kest)) +
  geom_jitter(size=0.1, alpha=0.5) +
  geom_abline(slope=1, colour="red", size=1.5) +
  geom_smooth(size=1.5) +
  facet_grid(cost ~ goal) +
  theme_bw()
  
# tile plot
## ksay vs kest
receiver %>%
  ggplot(aes(x=ksay, y=kest)) +
  geom_jitter(size=0.1, alpha=0.5) +
  geom_abline(slope=1, colour="red", size=1.5) +
  geom_smooth(size=1.5) +
  facet_grid(cost ~ goal) +
  theme_bw()


# for those going in correct direction, average
receiver %>%
  filter((goal == "over" & kest < ksay) | (goal == "under" & kest > ksay)) %>%
  mutate(kdiff = kest - ksay) %>%
  group_by(goal, cost) %>%
  summarise(n = n(),
            mean = mean(kdiff),
            sd = sd(kdiff))

sender %>%
  filter((goal == "over" & ksay > k) | (goal == "under" & ksay < k)) %>%
  mutate(kdiff = ksay - k) %>%
  group_by(goal, cost) %>%
  summarise(n = n(),
            mean = mean(kdiff),
            sd = sd(kdiff))


# bias ksay vs kest

receiver %>%
  mutate(bias.ksay = ksay-k,
         bias.kest = kest-k) %>%
  group_by(cost, goal, cond) %>%
  summarise(mean = mean(bias.kest),
            se = sd(bias.kest)/sqrt(n())) %>%
  ggplot(aes(x=goal, y=mean, fill=cond)) +
  geom_rect(data=NULL, xmin=0.54, xmax=1.45, ymin=0, ymax=5, fill="#8b2f00", alpha=0.2) +
  geom_rect(data=NULL, xmin=1.55, xmax=2.46, ymin=-5, ymax=0, fill="#003c70", alpha=0.2) +
  geom_bar(stat="identity", position="dodge", colour="black") +
  # geom_pointrange(aes(ymin=mean-se, ymax=mean+se), position=position_dodge(width=0.9), size=0.4) +
  # geom_segment() +
  scale_y_continuous(limits=c(-5,5)) +
  scale_fill_manual(values=condcolors) +
  guides(colour=FALSE) +
  theme_classic()



receiver %>%
  group_by(goal, cost) %>%
  summarise(bias.ksay = mean(ksay-k),
            bias.kest = mean(kest-k))


sender %>%
  group_by(goal, cost) %>%
  summarise(bias.ksay = mean(ksay-k),
            bias.kest = mean(kest-k))


summary(lmer((ksay - k) ~ k + cost * goal + (1 + cost | subjID) + (1 + goal | subjID), data=sender))
summary(lm((ksay - k) ~ k + cost * goal, data=sender))



# individual fits?

logitToProb <- function(logit){
  exp(logit) / (1+exp(logit))
}

probToLogit <- function(prob){
  log(prob / (1 - prob))
}

poisson.lies <- function(util, lambda, weight){
  weight = logitToProb(pmin(10, pmax(-10, weight)))
  lambda = exp(lambda)
  mapply(
    function(kx){
      ky = 0:100
      weight*dpois((ky-kx)*util, lambda)/ppois(ifelse(util==1, 100-kx, kx), lambda)+(1-weight)*(1/101)
    },
    0:100
  )
}

eval.s <- function(matr, ns){ #ns = 101 x 101 matrix for subj
  sum(log(matr)*ns)
}

poisson.lies(-1,log(20),probToLogit(0.01)) %>%
  as_tibble() %>%
  mutate(ky = 0:100) %>% 
  pivot_longer(-ky, names_to = 'kx', values_to='probability') %>% 
  mutate(kx = as.numeric(substr(kx, 2, 10))-1) %>%
  ggplot(aes(x=kx, y=ky, fill=probability)) +
  geom_tile()



subjLieCounts <- sender %>%
  count(subjID, k, ksay) %>%
  complete(subjID=unique(sender$subjID), 
           k=0:100, 
           ksay=0:100, 
           fill = list(n = 0)) %>%
  left_join(distinct(sender, subjID, goal, cost)) %>%
  mutate(goal = ifelse(goal=="over", 1, -1))

subjEstCounts <- receiver %>%
  count(subjID, ksay, kest) %>%
  complete(subjID=unique(sender$subjID), 
           ksay=0:100, 
           kest=0:100, 
           fill = list(n = 0)) %>%
  left_join(distinct(sender, subjID, goal, cost)) %>%
  mutate(goal = ifelse(goal=="over", 1, -1))

poissonFit = function(subj, counts, lambdaPenalty){
  df.l = counts %>%
    filter(subjID == subj) 
  ns.l <- df.l %>%
    pull(n) %>%
    matrix(nrow=101)
  
  poisson.LL <- function(lambda, weight){
    -eval.s(
      poisson.lies(unique(df.l$goal),lambda, weight),
      ns.l
    ) - lambda*lambdaPenalty
  }
  
  iter = 0
  fits = NULL
  fit = NULL
  while(is.null(fits)){
    try(fit <- summary(mle(poisson.LL,
                           start=list(lambda=rnorm(1, 0, 1),
                                      weight=rnorm(1, 0, 1)),
                           method = "BFGS")), TRUE)
    iter <- iter + 1
    if(!is.null(fit)){
      fits <- tibble(subjID = subj,
                    cost = unique(df.l$cost),
                    goal = unique(df.l$goal),
                    lambda.est = fit@coef['lambda','Estimate'],
                    lambda.se = fit@coef['lambda','Std. Error'],
                    weight.est = fit@coef['weight','Estimate'],
                    weight.se = fit@coef['weight','Std. Error'],
                    deviance = fit@m2logL)
    } else{
      if(iter>50){
        fits <- tibble(subjID = subj,
                      cost = unique(df.l$cost),
                      goal = unique(df.l$goal),
                      lambda.est = 0,
                      lambda.se = 0,
                      weight.est = 0,
                      weight.se = 0,
                      deviance = 0)
      }
    }
  }
  print(iter)
  return(fits)
}


  



fit.s.df <- tibble()
for(s in unique(sender$subjID)){
  fit.s.df <- fit.s.df %>%
    bind_rows(poissonFit(s, subjLieCounts, 10))
}

fit.s <- fit.s.df %>%
  mutate(lambda.est = lambda.est, # exp(lambda.est)
         weight.est = weight.est, # logitToProb(weight.est)
         deviance = deviance) %>%
  select(-c(lambda.se, weight.se)) %>%
  rename(s.lambda.est = lambda.est,
         s.weight.est = weight.est,
         s.deviance = deviance)


fit.r.df <- tibble()
for(s in unique(receiver$subjID)){
  fit.r.df <- fit.r.df %>%
    bind_rows(poissonFit(s, subjEstCounts, 1))
}

fit.r <- fit.r.df %>%
  mutate(lambda.est = lambda.est,
         weight.est = weight.est,
         deviance = deviance) %>%
  select(-c(lambda.se, weight.se)) %>%
  rename(r.lambda.est = lambda.est,
         r.weight.est = weight.est,
         r.deviance = deviance)


# compare sender and receiver
fit.all <- fit.s %>%
  left_join(fit.r, by=c("subjID","cost","goal")) %>%
  filter(s.deviance != 0, r.deviance != 0)

fit.all$s.weight.est

cor.test(fit.all$s.lambda.est, fit.all$r.lambda.est)
cor.test(fit.all$s.weight.est, fit.all$r.weight.est)

ggplot(fit.all, aes(x=s.lambda.est, y=r.lambda.est)) +
  geom_point(size=0.5) +
  geom_smooth(method="lm")

ggplot(fit.all, aes(x=s.weight.est, y=r.weight.est)) +
  geom_point(size=0.5) +
  geom_smooth(method="lm") +
  scale_x_continuous(limits=c(-2,5))



s2 <- sender %>%
  group_by(subjID, cost, goal) %>%
  summarise(mean.ksay = mean(ksay-k))

r2 <- receiver %>%
  group_by(subjID) %>%
  summarise(mean.kest = mean(kest-ksay))

s2 %>%
  left_join(r2) %>%
  ggplot(aes(x=mean.ksay, y=mean.kest, colour=goal, fill=goal)) +
  geom_point(size=0.5) +
  geom_smooth(method="lm") +
  scale_x_continuous("Sender's Mean Lie (Report - Truth)") +
  scale_y_continuous("Receiver's Mean Inferred Truth (Estimate - Report)") +
  facet_wrap(~cost) +
  theme_bw() +
  theme(strip.background = element_rect(fill="floralwhite"))
ggsave("img/indiv_lambda.png", width=7.5, height=4)

