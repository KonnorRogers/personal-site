---
title: Making EMS Helper - Introduction
date: "2019-12-05T05:07:36"
description: This is the beginning of EMS Helper. A service meant to provide
  people with the ability to quickly locate the closest appropriate hospital.
---

## Tech Stack

- Ruby on Rails v6.0.1
- Ruby 2.6.3

### Explanation

I am most familiar with Ruby on Rails and therefore felt I would be most
productive using Ruby on Rails for this project

## Deployment

I still have not decided between a self host option like Linode / DigitalOcean
or letting Heroku handle it for me. As this is a small personal project, and I would
like to get a feel for DevOps I will most likely be self hosting using DigitalOcean / Linode
combined with Docker containers.

## Scope

I plan for this to be very limited scope. Very simply, I plan to have a database
of every hospital. Each hospital will have an address and series of boolean
values as to its capabilities. The biggest challenge will be
aggregating the appropriate data.

## Data aggregation

Data aggregation seems to be the biggest challenge, thankfully someone has already
somewhat solved this problem.<br />
[https://hifld-geoplatform.opendata.arcgis.com/datasets/hospitals](https://hifld-geoplatform.opendata.arcgis.com/datasets/hospitals)
The Homeland Infrastructure Foundation has aggregated all hospitals in the 50 states
via each individual state department. They even have an easy to use API as well
as the added bonus of Trauma levels.

Unfortunately, they do not have things such as Stroke Centers, Cath labs, and various
point of entry capabilites. I will most likely be creating a scraper using Nokogiri to get this information from
each individual states respective website.

In addition, I plan to have a form for users to submit for review the addition of a new
hospital. I will most likely have to add a sign in system at some point
should this project gain any traction.

## Geocoding

What is geocoding? Geocoding and geolocation a way of quantifying a longitude
and latitude location for any given location.<br />
Geocoding and geolocation will be the basis of using a user's current location and searching the radius
for the closest appropriate facility. This is a big part of this project<br />

Again, this is another solved problem. Initially I had thought Google Maps was the only option,
on further review there is a lovely RubyGem called [Geocoder](https://github.com/alexreisner/geocoder)
which aggregates multiple APIs. I have not dug into what service it would call out to
as currently this is a tightly scoped project with no plans of hitting API request limits.

## Database backups

I have not settled on any particular service for database backups yet.
It is a consideration I have and it is worth noting. The database plans to be fairly
static, however, it's always good to be prepared.

As of now, the easiest option seems to set up a cron job to backup the database using
`pg_dump` and then sending that file to a remote server maybe like an AWS S3 bucket?

Alternatively, I found this github repo [https://github.com/fastmonkeys/stellar](https://github.com/fastmonkeys/stellar)
which appears to be a faster alternative to `pg_dump` and `pg_restore`. I still have not
settled on a good option but as this fleshes out it will become important

## Error Tracking

Sentry. Need I say more? Sentry is great its raved about, I may even integrate
with LogRocket. Again, future problem, not needed right away.

## CI / CD Pipeline

Yes, its a small project, but following best practices is not a bad thing.
Currently, I plan on using github actions as my CI / CD. Setting up Jenkins / Travis / CircleCI
seems like more headache than using an integrated option.

## Using docker-compose

As part of any good CI / CD pipeline, ideally I should be using Docker / containerization.
I have setup my docker-compose and Dockerfile in my repo to be used to provide a reproducible
environment. Unfortunately, I feel docker local development needs a little work,
but it definitely has its place in a CI / CD pipeline for sure as well as providing
a starting point for new users.

## Donations!

Its important to make sure that this can at least be self sustainable. I plan to
create a donations page which integrates with Stripe / Paypal to allow people to keep
the lights on!

## Closing thoughts

EMS Helper plans to be a free service which will take donations in order to keep the service running. I currently do not have plans to make it a paid service. In addition, you can follow along with my progress on the [development branch on Github.](https://github.com/ParamagicDev/ems_helper/tree/development)
