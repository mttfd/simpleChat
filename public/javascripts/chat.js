$(document).ready(function() {
  $(window).keydown(function (e) {
    if (e.keyCode == 116) {
      if (!confirm("refreshing page will make you lose all the chatting records. Are you sure to refresh？")) {
        e.preventDefault();
      }
    }
  });
  var socket = io.connect();
  var from = $.cookie('user');
  var to = 'all';

  socket.emit('online', {user: from});
  socket.on('online', function (data) {
    if (data.user != from) {
      var sys = '<div style="color:#f00">system(' + now() + '):' + 'User ' + data.user + ' is online! </div>';
    } else {
      var sys = '<div style="color:#f00">system(' + now() + '): You are now in the chatting room</div>';
    }
    $("#contents").append(sys + "<br/>");
    flushUsers(data.users);
    showSayTo();
  });

  socket.on('say', function (data) {
    if (data.to == 'all') {
      $("#contents").append('<div>' + data.from + '(' + now() + ')says: <br/>' + data.msg + '</div><br />');
    }
    if (data.to == from) {
      $("#contents").append('<div style="color:#00f" >' + data.from + '(' + now() + ')says to you: <br/>' + data.msg + '</div><br />');
    }
  });

  socket.on('offline', function (data) {
    var sys = '<div style="color:#f00">system(' + now() + '):' + 'User ' + data.user + ' is now offline！</div>';
    $("#contents").append(sys + "<br/>");
    flushUsers(data.users);
    if (data.user == to) {
      to = "all";
    }
    showSayTo();
  });

  socket.on('disconnect', function() {
    var sys = '<div style="color:#f00">system: Failed to connect to the server</div>';
    $("#contents").append(sys + "<br/>");
    $("#list").empty();
  });

  socket.on('reconnect', function() {
    var sys = '<div style="color:#f00">system: Reconnected to the server</div>';
    $("#contents").append(sys + "<br/>");
    socket.emit('online', {user: from});
  });


  function flushUsers(users) {
    $("#list").empty().append('<li title="db click to chat" alt="all" class="sayingto" onselectstart="return false">All Users</li>');
    for (var i in users) {
      $("#list").append('<li alt="' + users[i] + '" title="db click to chat" onselectstart="return false">' + users[i] + '</li>');
    }

    $("#list > li").dblclick(function() {
      if ($(this).attr('alt') != from) {
        to = $(this).attr('alt');
        $("#list > li").removeClass('sayingto');
        $(this).addClass('sayingto');
        showSayTo();
      }
    });
  }

  function showSayTo() {
    $("#from").html(from);
    $("#to").html(to == "all" ? "all users" : to);
  }

  function now() {
    var date = new Date();
    var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
    return time;
  }

  $("#say").click(function() {
    var $msg = $("#input_content").html();
    if ($msg == "") return;
    if (to == "all") {
      $("#contents").append('<div>You(' + now() + ') say to all users: <br/>' + $msg + '</div><br />');
    } else {
      $("#contents").append('<div style="color:#00f" >You(' + now() + ') says to ' + to + ' :<br/>' + $msg + '</div><br />');
    }
    socket.emit('say', {from: from, to: to, msg: $msg});
    $("#input_content").html("").focus();
  });
});
