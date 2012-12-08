var CaltrainFox = {
    is_weekend: false,
    station_from: null,
    station_to: null,

    // These are filled in by stops.js and stations.js, which are auto-generated
    // from the data provided by Caltrain.
    wd_nb: null,
    wd_sb: null,
    we_nb: null,
    we_sb: null,
    stations: null,

    find_trains: function find_trains(train_list) {
        var trains = [];
        for (var t of train_list) {
            if (t["stops"][this.station_from] !== -1 &&
                t["stops"][this.station_to] !== -1) {
                trains.push(t);
            }
        }

        return trains;
    },

    calculate_fare: function calculate_fare() {
        var base = 3;
        var zone_from = this.stations[this.station_from].zone;
        var zone_to = this.stations[this.station_to].zone;
        var num_zones = Math.abs(zone_to - zone_from);
        var fare = base + (2 * num_zones);
        return "" + fare + ".00";
    },

    format_time: function format_time(time) {
        var hours = Math.floor(time / 100);
        var minutes = time % 100;
        var ampm = "am";
        if (hours >= 12 && hours < 24) {
            ampm = "pm";
        }
        while (hours > 12) {
            hours -= 12;
        }

        var rval = "" + hours + ":";
        if (minutes < 10) {
            rval += "0";
        }
        rval = rval + minutes + " " + ampm;
        return rval;
    },

    format_duration: function format_duration(start_time, stop_time) {
        var start_hours = Math.floor(start_time / 100);
        var start_minutes = start_time % 100;
        var stop_hours = Math.floor(stop_time / 100);
        var stop_minutes = stop_time % 100;

        var start = (start_hours * 60) + start_minutes;
        var stop = (stop_hours * 60) + stop_minutes;

        if (stop < start) {
            // This train ends some time in the am of the day after it leaves
            stop = stop + (24 * 60);
        }

        var duration = stop - start;
        var hours = Math.floor(duration / 60);
        var minutes = duration % 60;
        var rval = "(";
        if (hours) {
            rval = rval + hours + "h";
        }
        rval = rval + minutes + "m)";

        return rval;
    },

    populate_timetable: function populate_timetable(trains) {
        var schedule = $("#schedule");

        while (schedule[0].firstChild) {
            schedule[0].removeChild(schedule[0].firstChild);
        }

        if (trains.length === 0) {
            var wrapper = $("<div></div>");
            wrapper.addClass("error_wrapper");

            var error = $("<div></div>");
            error.addClass("error");
            error.append("No Trains Found");

            wrapper.append(error);
            schedule.append(wrapper);
            return;
        }

        for (var t of trains) {
            var entry = $("<div></div>");
            entry.addClass("entry");

            var time = $("<div></div>");
            time.addClass("time");
            var start_time = t.stops[this.station_from];
            var stop_time = t.stops[this.station_to];
            var time_str = this.format_time(start_time);
            time_str += " - ";
            time_str += this.format_time(stop_time);
            time_str += " ";
            time_str += this.format_duration(start_time, stop_time);
            time.append(time_str);

            var train = $("<div></div>");
            train.addClass("train");
            if (t.train[0] === "2") {
                train.addClass("limited");
            } else if (t.train[0] === "3") {
                train.addClass("bullet");
            }
            train.append("#" + t.train);

            entry.append(time);
            entry.append(train);

            schedule.append(entry);
        }
    },

    do_update: function do_update() {
        var train_list = null;
        if (this.is_weekend) {
            if (this.station_to < this.station_from) {
                train_list = this.we_nb;
            } else {
                train_list = this.we_sb;
            }
        } else {
            if (this.station_to < this.station_from) {
                train_list = this.wd_nb;
            } else {
                train_list = this.wd_sb;
            }
        }

        var trains = this.find_trains(train_list);
        var fare = this.calculate_fare();
        $("#fare")[0].innerHTML = fare;
        this.populate_timetable(trains);
    },

    // The callback for when the user changes one of their station selections
    update_stations: function update_stations() {
        this.station_from = parseInt($("#station_from")[0].value);
        this.station_to = parseInt($("#station_to")[0].value);

        localStorage.setItem("station_from", this.station_from);
        localStorage.setItem("station_to", this.station_to);

        this.do_update();
    },

    update_wd_we_display: function update_wd_we_display() {
        var sel = $("#schedule_type_selector")[0];
        var cur = $("#schedule_type")[0];
        if (this.is_weekend) {
            sel.innerHTML = "Weekday";
            cur.innerHTML = "Weekend";
        } else {
            sel.innerHTML = "Weekend";
            cur.innerHTML = "Weekday";
        }
    },

    // The callback for when the user changes between weekend & weekday
    change_schedule_type: function change_schedule_type() {
        this.is_weekend = !this.is_weekend;

        this.update_wd_we_display();

        localStorage.setItem("is_weekend", this.is_weekend);

        this.do_update();
    },

    // The callback for when the user changes train direction
    reverse_direction: function reverse_direction() {
        var station_from = $("#station_from")[0];
        var station_to = $("#station_to")[0];

        station_from.childNodes[this.station_from].selected = false;
        station_to.childNodes[this.station_to].selected = false;

        [this.station_from, this.station_to] = [this.station_to, this.station_from];

        station_from.childNodes[this.station_from].selected = true;
        station_to.childNodes[this.station_to].selected = true;

        localStorage.setItem("station_from", this.station_from);
        localStorage.setItem("station_to", this.station_to);

        this.do_update();
    },

    populate_selectors: function populate_selectors() {
        var selectors = ["#station_from", "#station_to"];
        for (var s of selectors) {
            var selector = $(s);
            for (var station of this.stations) {
                var option = $("<option></option>")[0];
                option.value = station.station_id;
                option.innerHTML = station.station_name;
                if ((s === "#station_from" &&
                     this.station_from == station.station_id) ||
                    (s === "#station_to" &&
                     this.station_to === station.station_id)) {
                    option.selected = true;
                }
                selector.append(option);
            }
        }
    },

    setup: function setup() {
        var station_from = localStorage.getItem("station_from");
        var station_to = localStorage.getItem("station_to");
        var is_weekend = localStorage.getItem("is_weekend");

        // Default to from SF and to SJ
        if (!station_from) {
            this.station_from = 0; // San Francisco 4th & King
        } else {
            this.station_from = parseInt(station_from, 10);
        }

        if (!station_to) {
            // XXX: This will need changed if Caltrain ever builds another
            // station between SF and SJ
            this.station_to = 24; // San Jose Diridon
        } else {
            this.station_to = parseInt(station_to, 10);
        }

        this.populate_selectors();

        if (is_weekend === "true") {
            this.is_weekend = true;
            this.update_wd_we_display();
        }

        this.do_update();

        var events = ["click", "touch"];
        for (var e of events) {
            $("#reverse_menu").on(e, function() { CaltrainFox.reverse_direction(); });
            $("#schedule_type_menu").on(e, function() { CaltrainFox.change_schedule_type(); });
        }

        var selectors = ["#station_from", "#station_to"];
        for (var s of selectors) {
            $(s).on("change", function() { CaltrainFox.update_stations(); });
        }
    }
};

$(function () {
    CaltrainFox.setup();
});
