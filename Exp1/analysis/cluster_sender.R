

sr.2 %>%
  mutate(abs.mean.ksay = abs(mean.ksay),
         abs.mean.kest = abs(mean.kest),
         diff = abs.mean.kest - abs.mean.ksay) %>%
  pull(diff) %>%
  t.test()

sr.2 %>%
  mutate(abs.mean.ksay = abs(mean.ksay),
         abs.mean.kest = abs(mean.kest),
         diff = abs.mean.kest - abs.mean.ksay,
         diff.pos = diff > 0) %>%
  ungroup() %>%
  count(diff.pos)
ggplot(sr.2, aes(x=mean.ksay, y=mean.kest, colour=cond)) +
  geom_hline(yintercept=0, colour="gray40", size=0.3) +
  geom_vline(xintercept=0, colour="gray40", size=0.3) +
  geom_point(size=1, alpha=0.3, show.legend = FALSE) +
  stat_ellipse(size=0.6) +
  geom_point(data=sr.2.summ, aes(x=s.mean, y=r.mean, fill=cond),
             shape=23, colour="black", size=2.5) +
  geom_abline(slope=-1) +
  scale_x_continuous("Individual Sender's Mean *Report - Truth*", limits=c(-45, 45)) +
  scale_y_continuous("Individual Judge's Mean *Inferred - Report*", 
                     limits=c(-45, 45)) +
  scale_colour_manual("", values=condcolors2) +
  scale_fill_manual("", values=condcolors2) +
  theme_classic() +
  theme(legend.position = c(0.74, 0.88),
        strip.background = element_rect(fill=panelcolor),
        text=element_text(size=13, family="Optima"),
        axis.title.x = element_markdown(),
        axis.title.y = element_markdown())


# cluster
sender %>%
  filter(cost == "linear") %>%
  ggplot(aes(x=k, y=ksay, colour=goal)) +
  geom_abline(slope=1) +
  geom_point() +
  geom_smooth(colour="black") +
  scale_x_continuous(limits=c(0,100), expand=c(0,0)) +
  scale_y_continuous(limits=c(0,100), expand=c(0,0)) +
  facet_wrap(~subjID) +
  theme_bw() +
  theme(legend.position = "bottom")

library(stats4)


eval.s <- function(matr, ns){ #ns = 8 x 6 matrix of counts for all conditions
  sum(log(matr)*ns)
}

logitToProb <- function(logit){
  exp(logit) / (1+exp(logit))
}

probToLogit <- function(prob){
  log(prob / (1 - prob))
}

kx = 0:100
poisson.mixture <- function(util, lambda, weight){
  weight = logitToProb(pmin(10, pmax(-10, weight)))
  lambda = exp(lambda)
  mapply(
    function(k){
      kstar = kx
      weight*dpois((kstar-k)*util, lambda)/ppois(ifelse(util==1, 100-k, k), lambda)+(1-weight)*(1/length(kx))
    },
    kx
  )
}

poisson.mixture(-1, log(10), probToLogit(0.2))
poisson.pred(log(10), probToLogit(0.2))

poisson.pred <- function(lambda, weight){
  matrix(
    mapply(
      function(u) poisson.mixture(u, lambda, weight), #repeat for each base rate condition
      c(1, -1)), #repeat for each utility structure condition
    nrow=length(kx)^2)
}

sender.matr <- sender %>%
  filter(cost == "linear") %>%
  count(goal, k, ksay) %>%
  complete(goal=c("overestimate","underestimate"), k=0:100, ksay=0:100, fill = list(n = 0)) %>%
  pull(n) %>%
  matrix(nrow=length(kx)^2)


sender.LL <- function(lambda, weight){
  human <- sender.matr
  -eval.s(
    poisson.pred(lambda, weight),
    human
  )
}


sender.fit <- summary(mle(sender.LL,
                          start=list(lambda=rnorm(1, 0, 1),
                                     weight=rnorm(1, 0, 1)),
                          method = "BFGS"))
sender.coef = coef(sender.fit)
exp(sender.coef["lambda", "Estimate"])
poisson.pred(sender.coef["lambda", "Estimate"], sender.coef["weight", "Estimate"]) %>%
  # poisson.pred(log(10), probToLogit(0.2)) %>%
  as.data.frame() %>%
  rename(overest = V1,
         underest = V2) %>%
  mutate(ksay = rep(kx, length(kx)),
         k = rep(kx, each=length(kx))) %>%
  gather("goal","prob",1:2) %>%
  ggplot(aes(x=k, y=ksay, fill=prob)) +
  geom_tile() +
  scale_x_continuous(expand=c(0,0)) +
  scale_y_continuous(expand=c(0,0)) +
  scale_fill_gradient(low="white",high="purple") +
  facet_wrap(~goal)



sender %>%
  filter(cost == "linear") %>%
  count(goal, k, ksay) %>%
  complete(goal=c("overestimate","underestimate"), k=0:100, ksay=0:100, fill = list(n = 0)) %>%
  ggplot(aes(x=k, y=ksay, fill=n)) +
  geom_tile() +
  scale_x_continuous(expand=c(0,0)) +
  scale_y_continuous(expand=c(0,0)) +
  scale_fill_gradient(low="white",high="purple") +
  facet_wrap(~goal)
