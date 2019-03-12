//链式存储的线性表 单链表
#include <stdio.h>
#include <math.h>
#include <stdlib.h>

typedef struct LNode
{
    int data;
    struct LNode *next;
} LNode;

//头插法创建
LNode *create_list_head(void)
{
    int data;
    LNode *head, *p;
    head = (LNode *)malloc(sizeof(LNode));
    head->next = NULL;
    while (1)
    {
        printf("请输入：");
        scanf("%d", &data);
        if (data == 100)
            break;
        p = (LNode *)malloc(sizeof(LNode));
        p->data = data;
        // p->next = head->next;
        // head->next = p;
        p->next = head;
        head = p;
    }
    return head;
}
//尾插法创建
LNode *create_list_stern(void)
{
    int data;
    LNode *head, *stern, *p;
    head = stern = (LNode *)malloc(sizeof(LNode));
    //stern->next = NULL;
    while (1)
    {
        printf("请输入：");
        scanf("%d", &data);
        if (data == 100)
            break;
        p = (LNode *)malloc(sizeof(LNode));
        p->data = data;
        //p->next=NULL;
        stern->next = p;
        stern = p;
    }
    return head;
}
//查找
int get_elem(LNode *L, int i)
{
    int j = 0;
    LNode *p = L;
    while (p != NULL)
    {
        if (i == j)
        {
            return p->data;
        }
        p = p->next;
        j++;
        printf("%d,%d", i, j);
    }
    return -32768;
}
//插入
LNode *insert_list(LNode *L, int i, int elem)
{
    int j = 0;
    LNode *p = L;
    while (p != NULL)
    {
        if (i == j)
        {
            LNode *ele = (LNode *)malloc(sizeof(LNode));
            ele->next = p->next;
            ele->data = elem;
            p->next = ele;
            return L;
        }
        p = p->next;
        j++;
    }
    if (i > j || i < 0)
    {
        printf("i不在界限内");
        return NULL;
    }
    return L;
}
//删除
LNode *delete_list(LNode *L, int i)
{
    int j = 0;
    LNode *prve = NULL, *o = L;
    while (o != NULL)
    {
        if (i == j)
        {
            if (prve != NULL)
            {
                prve->next = o->next;
            }
            else
            {
                L = o->next;
            }
            free(o);
            return L;
        }
        prve = o;
        o = o->next;
        j++;
    }
    if (i > j || i < 0)
    {
        printf("i不在界限内");
        return NULL;
    }
    return L;
}
// //去重
// LNode *remove_duplicate_list(LNode *L)
// {
//     int record[10];
//     int i = 0;
//     while (L != NULL)
//     {
//         record[i] = 1;

//     }
// }
int main(void)
{
    LNode *list;
    // list = create_list_stern();
    // while (list->next != NULL)
    // {
    //     printf("链表：%d\n", list->data);
    //     list = list->next;
    // }
    // printf("链表：%d\n", list->data);

    // list = create_list_stern();
    // int result = get_elem(list, 2);
    // printf("查找的结果：%d", result);

    list = create_list_stern();
    //list = insert_list(list, 2, 999);
    list = delete_list(list, 1);
    while (list->next != NULL)
    {
        printf("链表：%d\n", list->data);
        list = list->next;
    }
    printf("链表：%d\n", list->data);
    return 0;
}