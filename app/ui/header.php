<header>
    <nav id="nav">
        <ul class="menu gray slide top" id="menu">
            <li>
                <?php echo Html::anchor('', 'DailyD');?>
                <!-- start level 2 -->
                <ul>
                    <li>
                        <a href="#">Add post</a>
                    </li>
                    <li>
                        <a href="#">Archive</a>
                        <!-- start level 3 -->
                        <ul>
                            <li>
                                <a href="#">By Author</a>
                            </li>
                            <li>
                                <a href="#">By Month</a>
                            </li>
                            <li>
                                <a href="#">By Year</a>
                            </li>
                        </ul>
                        <!-- end level 3 -->
                    </li>
                    <li>
                        <a href="#">Comments</a>
                    </li>
                </ul>
                <!-- end level 2 -->
            </li>
            <li>
                <a href="#">Mega menu</a>
                <!-- start mega menu -->
                <div class="cols4">
                    <div class="col4">
                        <h4>4 Columns with lists and a heading</h4>
                    </div>
                    <div class="col1">
                        <h5>Javascript</h5>
                        <ol>
                            <li>
                                <a href="#">Calendars</a>
                            </li>
                            <li>
                                <a href="#">Countdowns</a>
                            </li>
                            <li>
                                <a href="#">Database Abstractions</a>
                            </li>
                            <li>
                                <a href="#">Navigation</a>
                            </li>
                        </ol>
                    </div>
                    <div class="col1">
                        <h5>CSS</h5>
                        <ol>
                            <li>
                                <a href="#">Navigation and Menus</a>
                            </li>
                            <li>
                                <a href="#">Layouts</a>
                            </li>
                            <li>
                                <a href="#">Annimations and Effects</a>
                            </li>
                            <li>
                                <a href="#">Buttons</a>
                            </li>
                        </ol>
                    </div>
                    <div class="col1">
                        <h5>HTML5</h5>
                        <ol>
                            <li>
                                <a href="#">Canvas</a>
                            </li>
                            <li>
                                <a href="#">Media</a>
                            </li>
                            <li>
                                <a href="#">Libraries</a>
                            </li>
                            <li>
                                <a href="#">Presentations</a>
                            </li>
                        </ol>
                    </div>
                    <div class="col1">
                        <h5>Paragraph</h5>
                        <p>
                            A pure CSS menu with notification bubbles. A pure CSS menu with notification bubbles, CSS3 effects and different styles.
                        </p>
                    </div>
                </div>
                <!-- end mega menu -->
            </li>
            <li>
                <a href="#"> Messages</a>
            </li>
            <li>
                <a href="#"> Updates</a>
            </li>
            <li class="floatr">
                <a href="#"> Logout</a>
            </li>
            <li class="floatr">
                <a href="#"> Styles</a>
                <!-- start level 2 -->
                <ul>
                    <li>
                        <a href="gray.html">Gray</a>
                    </li>
                    <li>
                        <a href="black.html">Black</a>
                    </li>
                    <li>
                        <a href="blue.html">Blue</a>
                    </li>
                    <li>
                        <a href="bubbles.html">Bubbles</a>
                    </li>
                    <li>
                        <a href="macosx.html">Mac OS X</a>
                    </li>
                    <li>
                        <a href="mega.html">Mega menu</a>
                    </li>
                    <li>
                        <a href="jquery.html">jQuery</a>
                    </li>
                </ul>
                <!-- end level 2 -->
            </li>
        </ul>
        <!--
        <ol>
        <li>
        <?php echo Html::anchor('', 'DailyD');?>
        </li>
        <li>
        <?php echo Html::anchor('#', 'v' . $version, array('class' => 'version'));?>
        </li>
        <?php if ($loggedin) {
        ?>
        <li>
        <?php echo Html::anchor('user', $user->username, array('class' => 'user'));?>
        </li>
        <li>
        <?php echo Html::anchor('user/logout', 'Sign out');?>
        </li>
        <?php
        } else {
        ?>
        <li>
        <?php echo Html::anchor('user/login', 'Sign in');?>
        </li>
        <?php
        }
        ?>
        </li>
        <li id="loading" class="loading">
        <span>Loading</span>
        </li>
        </ol>
        -->
    </nav>
</header>
