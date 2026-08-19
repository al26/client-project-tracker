<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case PLANNING = 'Planning';
    case IN_PROGRESS = 'In Progress';
    case ON_HOLD = 'On Hold';
    case COMPLETED = 'Completed';
}
