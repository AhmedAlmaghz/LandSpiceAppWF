          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة الطلبات</CardTitle>
              <CardDescription>
                جميع طلبات المطاعم مع حالات المعالجة والتسليم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={orders}
                columns={columns}
                searchKey="orderNumber"
                onSelectionChange={setSelectedOrders}
                selectedItems={selectedOrders}
                emptyMessage="لا توجد طلبات"
                emptyDescription="لم يتم استلام أي طلبات بعد"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedComponent>
  )
}
