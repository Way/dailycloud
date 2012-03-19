<div id="user">
	Welcome <b><?php echo $username;?></b>
	<a href="<?php echo $logout;?>">Logout</a>
	
	<table>
	    <tr>
	        <td>Session id: </td>
	        <td><?php echo $user->session_id; ?></td>
	    </tr>
	    <tr>
	        <td>Last login: </td>
	        <td><?php echo date(DATE_RFC822, $user->last_login); ?></td>
	    </tr>
        <tr>
            <td>Created: </td>
            <td><?php echo date(DATE_RFC822, $user->created); ?></td>
        </tr>
	</table>	
</div>
