#include <stdio.h>
#include <stdlib.h>
#include <math.h>

double f(int n, double a[], double x)
{
    int i;
    double p=a[0];
    for (i=1;i<n;i++)
        p+=(a[i]*pow(x,i));
    return p;
}
