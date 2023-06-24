---
title: Making EMS Helper - Hiccups
date: "2019-12-18T20:48:45"
description: Detailing a few of the issues faced when attempting to populate the database.
---

## Aggregating the data

Unfortunately, as detailed in my [previous post](https://paramagicdev.github.io/my-blog/making-ems-helper/introduction)
populating the database will not be as easy as expected. Upon further inspection,
the database provided at [https://hifld-geoplatform.opendata.arcgis.com/datasets/hospitals/geoservice](https://hifld-geoplatform.opendata.arcgis.com/datasets/hospitals/geoservice) does not have a complete dataset. For example,
it only includes Westerly Hospital and the VA - Medical Center. As a result, I had to rethink
how to aggregate the data.

## Using Wikipedia

Wikipedia appears to have a semi-complete list. May be best to look into this as a means
to populate the database. They also appear to have a semi complete list of trauma centers.
No mention of PCI facilities is made on Wikipedia nor stroke centers.

## Moving forward

Unfortunately, it appearst this projects is more data aggregation heavy than it is
technically challenging. The time required to make the project work would be enormous.

Either on my part of getting the data myself or by using community involvement
and filtering in new locations. It just doesn't seem feasible at this time.
