---
layout: post
title: Using Reddit for Blog Comments
tags: general programming
excerpt: Reddit provides a wonderful system for voting stories up and down, discussing the stories along with new ites from each subreddit a user has subscribed to appearing in their news feed.  The subreddit system is ideal for building a community about a very specific topic. Because of this, I've decided to provide comments, discussion and discovery of articles for my blog via Reddit's subreddit model.  And here is how I did it.
---
Reddit provides a wonderful system for voting stories up and down,
discussing the stories along with new ites from each subreddit a user
has subscribed to appearing in their news feed.  The subreddit system
is ideal for building a community about a very specific topic.
Because of this, I've decided to provide comments, discussion and
discovery of articles for my blog via Reddit's subreddit model.  And
here is how I did it.

### Setting up the Subreddit ###
Once logged in, it's extremely easy and quick to get a subreddit set
up on [Reddit](http://www.reddit.com).  While it's all really
straightforward, there is one option that you would want to make sure
is set.  That is setting the Type to 'restricted: anyone can view, but
only some are approved to submit link'.  I chose to customize the CSS
of the subreddit to match the look-and-feel of the blog.  There may be
some guides out there on how to do this, I simply viewed th
stylesheets affecting each element I wanted to change and added an
entry to reflect what I wanted.  The end result was about an hour or
two of playing around and testing things out.  The subreddit is
located at
[http://www.reddit.com/r/ismarc](http://www.reddit.com/r/ismarc).

### Initial Reddit Integration ###
The initial integration with Reddit is as simple as adding a bit of
Javascript to the page and properly setting up the environment.  The
initial integration is simply a button provided by Reddit.  There's a
large number of choices for the format and information displayed.
Details about implementing it are available at
[http://www.reddit.com/buttons/](http://www.reddit.com/buttons/).  I
chose to go with an interactive button as I wanted readers to be able
to up and downvote the particular article without having to leave the
site.  The button is placed wherever you put the script tag for the
button.  The plus side is if you set everything up properly, you can
view your post and then submit it from there immediately.  The
relevant portion of my  post template ends up looking like:

    {% highlight html %}
    <script type="text/javascript">
      reddit_url = "http://ismarc.github.com{{ "{{ page.url " }}}}";
      reddit_title = "{{ "{{ page.title " }}}}";
      reddit_target = "ismarc";
    </script>
    <script type="text/javascript" src="http://www.reddit.com/static/button/button1.js"></script>
    {% endhighlight %}

With the initial integration completed, readers can see how the
article has been voted on by others.  The tiny Reddit alien head on
the left of the up and down arrows links to the discussion about the
post, but we want even more pervasive integration.

### Embedding Comments from Reddit ###
After a quick search, I was unable to find an existing solution for
using Reddit as the discussion forum for another site.  A quick search
later and I found the
[Reddit API](https://github.com/reddit/reddit/wiki/API).  It was
designed to be consumed by a client application, but there is nothing
preventing the client from being run in Javascript.  The work is made
much simpler by the API accepting a JSONP query parameter.  The
integration isn't as complete as I would like, but it is a good
starting point (I will cover what I would like to do later on).

There are two main endpoints that need to be used to get and display
the comments for a particular post:

* www.reddit.com/api/info.json -- Provides information about a
  resource.  For our use, a specific url is what we're concerned with,
  so the call is made as www.reddit.com/api/info.json?url=[url].
* www.reddit.com/comments/[page_id of url submission].json -- Provides
  the comments associated with a particular submission.
  
1. Retrieving the page id -- Any operation acting on a submission, or
to retrieve different sets of data about a submission requires the
base36 encoded identifier of the resource.  To retrieve the page id,
the template code for Jekyll looks something like:

      {% highlight js %}
      $.getJSON("http://www.reddit.com/api/info.json?url=" +
          escape("http://ismarc.github.com{{ "{{ page.url " }}}}") + "&jsonp=?",
                 function(result) {
                 /*
                    Information about the results is found in result.data.  We are
                    concerned with the actual listings.  Each listing is an entry in
                    result.data.children with each entry having two key values:
                    result.data.children[x].data.subreddit is the subreddit the url was
                    posted to (it can be submitted to multiple subreddits, in our case,
                    we care about only our own subreddit).  The other is
                    result.data.children[x].data.id, which is the base36 encoded
                    identifier we're looking for
        */
      });
      {% endhighlight %}

2. Retrieving the comments -- The API has a maximum number of entries
it will return with each call.  For our purposes, the default value is
appropriate to display a decent portion of the comments.  The code to
retrieve the comments looks something like:

      {% highlight js %}
      $.getJSON("http://www.reddit.com/comments/" + pageId +
          ".json?jsonp=?",
                function(result) {
                    /*
                       The result is an array of entries, the second of which contains the
                       actual comments.  Of that entry, the data. holds an array of the
                       comments themselves, suitable for rendering the comments in the page.
                       The key information is: comment.data.author (the author of the
                       comment), comment.data.ups (number of upvotes), comment.data.downs
                       (number of downvotes), comment.data.created_utc (time the comment was
                       created), comment.data.replies (identically structured comments that
                       were in reply to the comment).
                     */
                });
      {% endhighlight %}

Now that we have a way to retrieve the data about the post, it's just
a matter of formatting and rendering the content how we want to.  The
quickly and horribly written Javascript I use is available at
[https://github.com/ismarc/ismarc.github.com/blob/master/javascripts/reddit_comments.js](https://github.com/ismarc/ismarc.github.com/blob/master/javascripts/reddit_comments.js).
It's available under the MIT license and I will likely be cleaning it
up and slowly building out to cover my dreams of the future covered in
the next section.  It is missing a lot of error handling and has
hardcoded values in some places, but should at a minimum be a jumping
off point for a similar implementation.

### The Future ###
If you visit the comments page of any submission on Reddit, that is
the full functionality I would like to provide access to.  However,
that requires login integration as well as cross-site POST requests
for submission of data.  Since it is a more involved process and has
potential security implications, I'm not going to just throw something
together.  Instead, as I have time, I'll work on implementing the
system...unless someone else would care to put it together and let me
know.
