data.frame(cost = rep(c("infinite","low"), each=11),
           message = rep(0:10,2)) %>%
  mutate(estimate = ifelse(cost=="infinite", message, log2(message+1))) %>%
  ggplot(aes(x=message, y=estimate, colour=cost, fill=cost)) +
  geom_point() +
  geom_line() +
  scale_x_continuous("sender's message", breaks=seq(0,10,2)) +
  scale_y_continuous("judge's estimate of truth", breaks=seq(0,10,2)) +
  theme_bw()
