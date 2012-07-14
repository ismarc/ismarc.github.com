/*
The MIT License (MIT)
Copyright (c) 2012 Matthew Brace

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/*
 * Interface for retrieving comments for a given page from the Reddit
 * API.  Example usage:
 *        $(document).ready(
 *          $.getJSON("http://www.reddit.com/api/info.json?url=" +
 *            escape("<URL>") +
 *            "&jsonp=?",
 *          function(data) {
 *            RedditComments.populateData(data, function(comments) {
 *              RedditComments.drawComments(comments, $("#comments"));
 *         })}));
 */
var RedditComments = {
    /*
     *  Takes a data object as returned from info.json&url=[X] and
     *  calls callback with the list of comments returned for the
     *  submission.
     */
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

    /*
     * Renders the comments into a given element using a similar
     * format to Reddit.  The associated styles are not included.
     */
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
