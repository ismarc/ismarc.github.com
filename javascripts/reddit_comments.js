var RedditComments = {
    populateData: function(data, callback) {
        if (data.data.children.length == 0) {
            callback([]);
        } else {
            $("#discussion_link").
                append("<a href=\"http://www.reddit.com/r/ismarc/comments/" +
                       RedditComments.getPageId(data, "ismarc") +
                       "\">Join the discussion</a>");
            $.getJSON("http://www.reddit.com/comments/" +
                      RedditComments.getPageId(data, "ismarc") +
                      ".json?jsonp=?",
                      function(data) {
                          callback(
                              RedditComments.getPageComments(data));
                      });
        }
                  
    },

    getPageId: function(data, subreddit) {
        for (var i = 0; i < data.data.children.length; i++) {
            if (data.data.children[i].data.subreddit == subreddit) {
                return data.data.children[i].data.id;
            }
        }
    },

    getPageComments: function(data) {
        if (data[1] != undefined) {
            return data[1].data.children;
        }

        return [];
    },

    drawComments: function(comments, element) {
        $(comments).each( function(index, comment) {
            element.append(RedditComments.buildCommentBlock(comment));
        });
    },

    buildCommentBlock: function(comment) {
        var element = $("<div class=\"thing comment\"></div>");
        var likes = $("<div class=\"entry likes\"></div>");
        var noncollapsed = $("<div></div>");
        var tagline = $("<p class=\"tagline\"></p>");
        tagline.append($("<a href=\"http://www.reddit.com/user/" +
                         comment.data.author +
                         "\" class=\"author\">" +
                         comment.data.author + "</a>"));
        var score = comment.data.ups - comment.data.downs;
        tagline.append($("<span class=\"score likes\"> " +
                         score + " points </span>"));
        var now = new Date();
        var comment_date = new Date(comment.data.created_utc*1000);
        var days_ago = Math.round(
            (now - comment_date) / (1000*60*60*24));
        if (days_ago > 0) {
            days_ago = days_ago + " days ago";
        } else {
            days_ago = Math.round(
                (now - comment_date) / (1000*60*60));
            if (days_ago > 0) {
                days_ago = days_ago + " hours ago";
            } else {
                days_ago = Math.round(
                    (now - comment_date) / (1000*60));
                days_ago = days_ago + " minutes ago";
            }
        }
        tagline.append($("<time title=\"" +
                         new Date(comment.data.created_utc*1000) +
                         "\" datetime=\"" +
                         new Date(comment.data.created_utc*1000) +
                         "\">" + days_ago + "</time>"));
        noncollapsed.append(tagline);
        var userbody = $("<div class=\"usertext-body\"></div>");
        var md = $("<div class=\"md\"></div>");
        md.append($("<p>" + comment.data.body + "</p>"));
        userbody.append(md);
        noncollapsed.append(userbody);
        likes.append(noncollapsed);
        element.append(likes);
        if (comment.data.replies != "") {
            $(comment.data.replies.data.children).each(
                function(index, comment) {
                    var child = $("<div class=\"child\"></div>");
                    child.append(
                        RedditComments.buildCommentBlock(comment));
                    element.append(child);
                });
        }
        return element;
    }
};
