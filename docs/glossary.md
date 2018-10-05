# Glossary

This document intent is to clarify why certain words are used and what they are really about.

# Agile Practices

## Iteration

A 2 weeks development period with a **clear product focus**. Its activity backlog is populated with items related to the iteration focus. We work only on these items.

The iteration starts with a planning session and ends with a retrospective session.

## Backlog

It is a collection of items which represent the actions we _intend_ to do.

Large projects can have several backlogs: the project backlog and the iteration backlog.

## Planning Session

The **Product Owner** sorts the iteration backlog by order of priority. The priority serves the iteration focus.

During the session, the Product Owner and the developers go in details about the intent of each item, and eventually break them down in several items.

## Item

An item is an **expectation with a purpose**. The title and the description of the item leaves no doubt about what has to be done, and it is generally no longer than a day or two in term of effort to complete it.

## Retrospective Session

The group reflects about what they learned, what they would like to do to improve the project dynamics, what is still a mystery to them and what they wish would happen.

It is an essential session for continuous learning organisation.

## Pair Programming

A practical exercise when two people work in tandem on a same task, in synchronicity. They usually learn from each other practices and the outcome benefit from a better quality thanks to the dialogue they establish around the item implementation.

## (GitHub) Project

A Project is a columned left-to-right flow: a card is taken from the `TODO` column by the person working on it as it is _pulled into_ the `DOING`

# Code

## Commit

It is a save point in the history of a software codebase. It records a change between now and the previous commit.

Commits are labeled with a message to indicate the intent of the change. They help understand what has changed with human terms, as an addition to the code itself.

## Branch

A branch is a succession of commits. We create new branches to explore new ideas, to develop new features, to submit fixes without interrupting the stability of the main branch, the `master` branch.

Branches are discarded or _merged_ into other ones, usually via _Pull Requests_.
There is a [page to visualise past and active branches](https://github.com/GFDRR/open-risk-data-dashboard/network).

## `master` Branch

It is the stable version of the code we feel comfortable to deploy at any time.

## Pull Request

A Pull Request is a proposition to integrate a branch into another (generally, into the `master` branch).


# Tools and Services

## Netlify

[Netlify](https://app.netlify.com/sites/index-opendri-preview/overview) is a _continuous integration_ service to preview changes before we integrate them in the

## Travis CI

[Travis CI](https://travis-ci.com/GFDRR/open-risk-data-dashboard) is a _continuous integration_ service we use to deploy the frontend application when it satisfies our quality criteria.

# Applications

## Front-end

It is an HTML/CSS/JavaScript set of pages to present informations in the context of user expectations. Dynamic data are fetched from the back-end application, via its API.

## Back-end

It is a Python application that stores the data in a database and exposes them via an API, to be queried by the front-end application or any other sofware with an Internet access.

## API

It is an interface to share and receive structured data. It helps to decouple the storage of the data from their presentation.
